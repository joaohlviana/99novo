import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Heart, Star, MapPin, Filter, Search, Bell } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function GlassEffectsDemo({ onNavigateBack }: { onNavigateBack?: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Glass Header */}
        <header className="glass border-b border-glass-border p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">Glass Morphism Demo</h1>
            <div className="flex items-center gap-4">
              {onNavigateBack && (
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 hover:backdrop-blur-sm"
                  onClick={onNavigateBack}
                >
                  ← Voltar
                </Button>
              )}
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:backdrop-blur-sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button className="bg-[#FF385C]/90 hover:bg-[#E31C5F]/90 text-white backdrop-blur-sm">
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Glass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Basic Glass Card */}
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Trainer Profile</h3>
                <Button variant="ghost" size="sm" className="hover:bg-white/20">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                  alt="Trainer"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">João Silva</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">4.9 (127)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">São Paulo, SP</span>
              </div>
              
              <div className="flex gap-2">
                <Badge className="bg-blue-100/80 text-blue-800 backdrop-blur-sm">Musculação</Badge>
                <Badge className="bg-green-100/80 text-green-800 backdrop-blur-sm">Funcional</Badge>
              </div>
            </div>
          </Card>

          {/* Glass Input Card */}
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Search Filters</h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    className="input-glass pl-10" 
                    placeholder="Search trainers..."
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="sp">São Paulo</SelectItem>
                    <SelectItem value="rj">Rio de Janeiro</SelectItem>
                    <SelectItem value="bh">Belo Horizonte</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="w-full glass hover:bg-white/90 text-gray-900 border border-glass-border">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Glass Stats Card */}
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Platform Stats</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2.3K</div>
                  <div className="text-sm text-gray-600">Trainers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">15K</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">4.8</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Glass Dialog Demo */}
        <div className="flex justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glass hover:bg-white/90 text-gray-900 border border-glass-border px-8 py-3">
                Open Glass Dialog
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border border-glass-border">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Glass Morphism Dialog</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-gray-700">
                  This dialog demonstrates the glass morphism effect with backdrop blur and transparency.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="glass border-glass-border">
                    Cancel
                  </Button>
                  <Button className="bg-[#FF385C]/90 hover:bg-[#E31C5F]/90 text-white backdrop-blur-sm">
                    Confirm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Glass Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Premium Experience</h3>
              <p className="text-gray-700">
                Beautiful glass morphism effects that create depth and modern aesthetics in your UI.
              </p>
            </div>
          </Card>
          
          <Card className="glass-card p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">User Friendly</h3>
              <p className="text-gray-700">
                Transparent elements with subtle backgrounds enhance user experience and visual hierarchy.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}