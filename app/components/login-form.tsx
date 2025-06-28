"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Mail, Lock, Sparkles } from "lucide-react"

interface LoginFormProps {
  onLogin: (user: any) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = {
      id: 1,
      name: "Space Explorer",
      email: loginData.email,
      joinDate: new Date().toISOString(),
    }

    onLogin(user)
    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = {
      id: 2,
      name: signupData.name,
      email: signupData.email,
      joinDate: new Date().toISOString(),
    }

    onLogin(user)
    setIsLoading(false)
  }

  const handleDemoLogin = () => {
    const demoUser = {
      id: 999,
      name: "Cosmic Voyager",
      email: "demo@cosmiclibrary.space",
      joinDate: new Date().toISOString(),
    }
    onLogin(demoUser)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Rocket className="h-12 w-12 text-purple-400" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
        </div>
        <p className="text-purple-300 text-sm">Embark on your journey through the cosmos of knowledge</p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-purple-500/20">
          <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Launch Pad
          </TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            New Mission
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-200">Welcome Back, Explorer</CardTitle>
              <CardDescription className="text-purple-400">Continue your cosmic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-300">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Cosmic Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="explorer@galaxy.space"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-300">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Security Code
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Launching..." : "Launch Mission"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-200">Join the Crew</CardTitle>
              <CardDescription className="text-purple-400">Begin your exploration of the universe</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-purple-300">
                    <Sparkles className="h-4 w-4 inline mr-2" />
                    Explorer Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Captain Cosmos"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    className="bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-purple-300">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Cosmic Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="explorer@galaxy.space"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-purple-300">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Security Code
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Preparing Launch..." : "Begin Mission"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-purple-500/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-purple-400">Or</span>
          </div>
        </div>
        <Button
          onClick={handleDemoLogin}
          variant="outline"
          className="w-full mt-4 bg-black/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-100"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Quick Demo Flight
        </Button>
      </div>
    </div>
  )
}
