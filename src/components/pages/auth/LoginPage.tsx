import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { List, Eye, EyeSlash, GoogleLogo, FacebookLogo, Warning } from "@phosphor-icons/react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import yelloIconJpg from "@/assets/images/yello-icon.svg"
import { AuthUser, ensureAuthUserSession, useAuth } from "@/hooks/use-auth"

interface LoginPageProps {
  onToggleSidebar: () => void
  onLoginSuccess: (user: AuthUser) => void
}

export function LoginPage({ onToggleSidebar, onLoginSuccess }: LoginPageProps) {
  const [users, setUsers] = useKV<AuthUser[]>("auth-users", [])
  const { setUser: setAuthUser, loginWithFacebook } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [cpf, setCpf] = useState("")
  const [phone, setPhone] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Preencha todos os campos")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const user = (users || []).find(u => u.email === email)
      
      if (user) {
        const normalizedUser = ensureAuthUserSession(user)
        setAuthUser(normalizedUser)
        setUsers((current) => {
          const list = current || []
          return list.map(u => u.id === user.id ? normalizedUser : u)
        })
        onLoginSuccess(normalizedUser)
        toast.success(`Bem-vindo, ${normalizedUser.name}!`)
      } else {
        toast.error("Credenciais inválidas")
      }
      
      setIsLoading(false)
    }, 800)
  }

  const handleRegister = async () => {
    if (!email || !password || !name || !cpf || !phone) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const existingUser = (users || []).find(u => u.email === email)
      
      if (existingUser) {
        toast.error("E-mail já cadastrado")
        setIsLoading(false)
        return
      }

      const newUser = ensureAuthUserSession({
        id: Date.now().toString(),
        email,
        name,
        cpf,
        phone,
        createdAt: Date.now()
      } as Omit<AuthUser, "session">)

      setUsers((current) => [...(current || []), newUser])
      setAuthUser(newUser)
      onLoginSuccess(newUser)
      toast.success("Cadastro realizado com sucesso!")
      setIsLoading(false)
    }, 800)
  }

  const handleSocialLogin = (provider: string) => {
    if (provider === "Facebook") {
      toast.info("Redirecionando para o Facebook OAuth...")
      try {
        setIsLoading(true)
        loginWithFacebook()
      } catch (error) {
        console.error("Erro ao iniciar Facebook OAuth", error)
        toast.error("Não foi possível iniciar o login com o Facebook. Verifique as variáveis de ambiente.")
        setIsLoading(false)
      }
      return
    }

    toast.info(`Login com ${provider} em desenvolvimento`)
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors"
          >
            <List size={22} weight="bold" />
          </button>
          <motion.div 
            className="w-11 h-11 rounded-xl overflow-hidden shadow-lg"
            whileHover={{ scale: 1.08, rotate: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img src={yelloIconJpg} alt="Yello Logo" className="w-full h-full object-cover" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-solar-r bg-clip-text text-transparent">
              Acesso ao Sistema
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Entre ou crie sua conta</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Entrar na sua conta</CardTitle>
                  <CardDescription>
                    Use suas credenciais para acessar o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="px-0 h-auto text-sm"
                    onClick={() => toast.info("Recuperação de senha em desenvolvimento")}
                  >
                    Esqueceu sua senha?
                  </Button>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button
                    className="w-full bg-gradient-solar-r"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin("Google")}
                      disabled={isLoading}
                    >
                      <GoogleLogo size={18} weight="bold" className="mr-2" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin("Facebook")}
                      disabled={isLoading}
                    >
                      <FacebookLogo size={18} weight="bold" className="mr-2" />
                      Facebook
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Criar nova conta</CardTitle>
                  <CardDescription>
                    Preencha seus dados para se cadastrar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="João da Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-cpf">CPF</Label>
                    <Input
                      id="register-cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Telefone</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirmar Senha</Label>
                    <Input
                      id="register-confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Warning size={16} className="flex-shrink-0" />
                    <span>Seus dados serão armazenados com segurança em conformidade com a LGPD</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-solar-r"
                    onClick={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? "Cadastrando..." : "Criar Conta"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              Ao continuar, você concorda com nossos{" "}
              <button className="underline hover:text-foreground">Termos de Serviço</button>
              {" "}e{" "}
              <button className="underline hover:text-foreground">Política de Privacidade</button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
