import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MagnifyingGlass, MapPin, Spinner, X } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface LocationResult {
  lat: number
  lon: number
  displayName: string
  address: {
    road?: string
    house_number?: string
    suburb?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
}

interface SolarLocationSearchWidgetProps {
  data: {
    initialAddress?: string
  }
  onAction?: (action: { type: string; payload: any }) => void
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

export function SolarLocationSearchWidget({ data, onAction }: SolarLocationSearchWidgetProps) {
  const [searchQuery, setSearchQuery] = useState(data.initialAddress || "")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<LocationResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (data.initialAddress && data.initialAddress.length > 0) {
      void handleSearch(data.initialAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.initialAddress])

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=br`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'YelloSolarHub/1.0'
          }
        }
      )

      if (!response.ok) {
        setError('Erro ao buscar localização. Tente novamente.')
        setResults([])
        setIsSearching(false)
        return
      }

      const data = await response.json()
      
      const formattedResults: LocationResult[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        displayName: item.display_name,
        address: {
          road: item.address.road,
          house_number: item.address.house_number,
          suburb: item.address.suburb || item.address.neighbourhood,
          city: item.address.city || item.address.town || item.address.village,
          state: item.address.state,
          postcode: item.address.postcode,
          country: item.address.country
        }
      }))

      setResults(formattedResults)

      if (formattedResults.length === 0) {
        toast.error("Nenhum endereço encontrado. Tente ser mais específico.")
      }
    } catch (error) {
      console.error('Error searching location:', error)
      toast.error("Erro ao buscar endereço. Tente novamente.")
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      void handleSearch(value)
    }, 500)
  }

  const handleSelectLocation = (location: LocationResult) => {
    setSelectedLocation(location)
    setResults([])
    setSearchQuery(location.displayName)
    
    onAction?.({
      type: "location_selected",
      payload: location
    })
  }

  const handleClear = () => {
    setSearchQuery("")
    setResults([])
    setSelectedLocation(null)
  }

  const handleNewSearch = () => {
    setSelectedLocation(null)
    setSearchQuery("")
    setResults([])
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="max-w-2xl border-2 shadow-xl overflow-hidden bg-card">
        <div className="bg-gradient-to-br from-[hsl(var(--solar-yellow))]/20 via-[hsl(var(--solar-red))]/10 to-[hsl(var(--solar-pink))]/20 p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <MapPin className="text-white" size={24} weight="fill" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Localização do Imóvel</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Digite o endereço para iniciar a análise solar
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {!selectedLocation ? (
            <>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ex: Rua das Flores, 123 - Jardim Paulista, São Paulo"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="pr-20 h-12 text-base border-2 focus:border-accent"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      className="h-8 w-8"
                      aria-label="Limpar busca"
                    >
                      <X size={16} weight="bold" />
                    </Button>
                  )}
                  {isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <Spinner size={20} className="text-accent" />
                    </motion.div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSearch(searchQuery)}
                      className="h-8 w-8"
                      aria-label="Pesquisar endereço"
                    >
                      <MagnifyingGlass size={20} weight="bold" />
                    </Button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {results.map((result, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectLocation(result)}
                          className="w-full p-4 rounded-xl border-2 border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                              <MapPin size={20} weight="fill" className="text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {result.address.road && result.address.house_number
                                  ? `${result.address.road}, ${result.address.house_number}`
                                  : result.displayName.split(',')[0]}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {result.displayName}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  💡 <strong>Dica:</strong> Você pode digitar o CEP, endereço completo ou nome do local
                </p>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                    <MapPin size={24} weight="fill" className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800 dark:text-green-200 mb-1 uppercase tracking-wide">
                      ✓ Localização Confirmada
                    </p>
                    <p className="text-base font-bold text-green-900 dark:text-green-100 mb-2">
                      {selectedLocation.displayName}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-700 dark:text-green-300 font-medium">Latitude:</span>
                        <span className="ml-1 font-bold text-green-900 dark:text-green-100">
                          {selectedLocation.lat.toFixed(6)}°
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300 font-medium">Longitude:</span>
                        <span className="ml-1 font-bold text-green-900 dark:text-green-100">
                          {selectedLocation.lon.toFixed(6)}°
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                  <Button
                    variant="outline"
                    onClick={handleNewSearch}
                    className="w-full border-2"
                  >
                    <MagnifyingGlass className="mr-2" size={18} weight="bold" />
                    Nova Busca
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
