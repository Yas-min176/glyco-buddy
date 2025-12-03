import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, Eye, EyeOff, Heart, Users, Stethoscope } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter no mínimo 2 caracteres');

type UserType = 'patient' | 'caregiver' | 'doctor';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('patient');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    if (!isLogin) {
      try {
        nameSchema.parse(name);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.name = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast({
              title: 'Erro ao entrar',
              description: 'Email ou senha incorretos.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao entrar',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Bem-vindo de volta! 🐝',
            description: 'Login realizado com sucesso.',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, name, userType);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Email já cadastrado',
              description: 'Este email já possui uma conta. Tente fazer login.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao criar conta',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Conta criada! 🐝',
            description: 'Bem-vindo ao Beez!',
          });
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: 'Email obrigatório',
        description: 'Digite seu email para recuperar a senha.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: 'Email enviado! 📧',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background honeycomb-pattern flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <span className="text-7xl block mb-2 animate-bounce-gentle">🐝</span>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight">
              Beez
            </h1>
            <p className="text-muted-foreground mt-1">
              Recuperar senha
            </p>
          </div>

          {/* Form Card */}
          <div className="card-elevated p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Esqueceu sua senha?
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="resetEmail" className="text-base font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-2 h-14 text-lg"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-bold"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-primary font-semibold hover:underline"
              >
                ← Voltar para o login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background honeycomb-pattern flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <span className="text-7xl block mb-2 animate-bounce-gentle">🐝</span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">
            Beez
          </h1>
          <p className="text-muted-foreground mt-1">
            Seu guia de glicemia e insulina
          </p>
        </div>

        {/* Form Card */}
        <div className="card-elevated p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-2 h-14 text-lg"
                />
                {errors.name && (
                  <p className="text-danger text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {!isLogin && (
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Tipo de Conta
                </Label>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as UserType)} className="space-y-3">
                  <div className="flex items-center space-x-3 bg-accent p-4 rounded-lg cursor-pointer hover:bg-accent/80 border border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Heart className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Paciente</div>
                        <div className="text-sm text-muted-foreground">Faço o controle da minha glicemia</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 bg-accent p-4 rounded-lg cursor-pointer hover:bg-accent/80 border border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="caregiver" id="caregiver" />
                    <Label htmlFor="caregiver" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Cuidador/Responsável</div>
                        <div className="text-sm text-muted-foreground">Acompanho um paciente</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 bg-accent p-4 rounded-lg cursor-pointer hover:bg-accent/80 border border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Médico/Profissional</div>
                        <div className="text-sm text-muted-foreground">Monitoro meus pacientes</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-2 h-14 text-lg"
              />
              {errors.email && (
                <p className="text-danger text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Senha
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="h-14 text-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-bold mt-6"
              disabled={loading}
            >
              {loading ? 'Carregando...' : isLogin ? 'Entrar 🐝' : 'Criar Conta 🐝'}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in">
          Desenvolvido com 💛 para ajudar pacientes diabéticos
        </p>
      </div>
    </div>
  );
};

export default Auth;