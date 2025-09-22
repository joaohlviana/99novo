import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, ChevronDown, User, Zap, Filter, Check, MapPin, Settings, ChevronUp, LogIn, LogOut, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './auth/LoginModal';
import { LoadingSpinner } from './ui/loading-spinner';

// Props drilling ELIMINADO - agora o Header não precisa de props de navegação
interface HeaderProps {}

export function Header({}: HeaderProps) {
  const navigation = useNavigation();
  const { user, isAuthenticated, logoutAndRedirect, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [searchType, setSearchType] = useState<'trainers' | 'programs'>('trainers');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Close dropdown when clicking outside - MOVER ANTES DO EARLY RETURN
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setIsExploreOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock data
  const availableSports = [
    'Musculação', 'Funcional', 'Yoga', 'Crossfit', 'Corrida', 
    'Pilates', 'Natação', 'Futebol', 'Basquete', 'Tênis'
  ];

  const availableCities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 
    'Salvador', 'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Goiânia'
  ];

  // Calculate active filters count
  const activeFiltersCount = selectedSports.length + selectedCities.length + (searchType !== 'trainers' ? 1 : 0) + (!isOnline ? 1 : 0);

  // Early return para loading state - AGORA DEPOIS DE TODOS OS HOOKS
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={navigation.navigateToHome}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://cdn.prod.website-files.com/610165a842cc98cbd9ae2ba5/6508a3f687afc532e6f8fe67_99coach.svg"
                alt="99coach"
                className="h-8 w-auto"
              />
            </button>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-brand rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 hidden sm:inline">Conectando...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const exploreOptions = [
    { 
      title: 'Treinadores', 
      description: 'Encontre especialistas em sua modalidade',
      onClick: navigation.navigateToCatalog 
    },
    { 
      title: 'Programas', 
      description: 'Programas estruturados para todos os níveis',
      onClick: () => navigation.navigateToCatalog() // Temporariamente redireciona para catálogo
    },
    { 
      title: 'Modalidades', 
      description: 'Explore todas as modalidades esportivas',
      onClick: () => navigation.navigateToCatalog() // Temporariamente redireciona para catálogo
    }
  ];

  const clearAllFilters = () => {
    setSearchType('trainers');
    setSelectedSports([]);
    setIsOnline(true);
    setSelectedCities([]);
  };

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center">
          <button 
            onClick={navigation.navigateToHome}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src="https://cdn.prod.website-files.com/610165a842cc98cbd9ae2ba5/6508a3f687afc532e6f8fe67_99coach.svg"
              alt="99coach"
              className="h-8 w-auto"
            />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
          
          {/* Explorar Dropdown */}
          <div className="relative z-[200]" ref={exploreRef}>
            <Button
              variant="ghost"
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <span>Explorar</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isExploreOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[200]">
                {exploreOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      option.onClick();
                      setIsExploreOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{option.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <div className="relative min-w-[200px] max-w-lg flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar treinadores, modalidades..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-brand cursor-pointer"
                    readOnly
                  />
                  {/* Active filters indicator */}
                  {hasActiveFilters && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="h-5 text-xs bg-brand text-brand-foreground">
                        {activeFiltersCount}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </DialogTrigger>
            
            <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogTitle className="sr-only">Buscar na plataforma</DialogTitle>
              <DialogDescription className="sr-only">
                Busque por treinadores, modalidades esportivas e programas de treino
              </DialogDescription>
              <div className="space-y-6">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar treinadores, modalidades, programas..."
                    className="pl-12 text-lg h-12 border-2 focus:border-brand transition-colors"
                    autoFocus
                  />
                </div>

                {/* Smart Filters Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Filtros Inteligentes</h3>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="bg-brand text-brand-foreground text-xs">
                        {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs text-gray-500 hover:text-red-500 h-auto p-1"
                      >
                        Limpar tudo
                      </Button>
                    )}
                    <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          {filtersExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </div>
                </div>

                {/* Advanced Filters */}
                <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
                  <CollapsibleContent className="space-y-5">
                    <div className="border rounded-xl p-5 bg-gradient-to-br from-gray-50/50 to-gray-100/30 backdrop-blur-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        
                        {/* Left Column */}
                        <div className="space-y-4 sm:space-y-5">
                          {/* Search Type */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-800 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand"></div>
                              Estou procurando por
                            </Label>
                            <RadioGroup 
                              value={searchType} 
                              onValueChange={(value: 'trainers' | 'programs') => setSearchType(value)}
                              className="flex flex-col sm:flex-row gap-2 sm:gap-4"
                            >
                              <Label 
                                htmlFor="trainers" 
                                className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all flex-1 ${
                                  searchType === 'trainers' 
                                    ? 'border-brand bg-brand/5' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <RadioGroupItem value="trainers" id="trainers" />
                                <span className="text-sm font-medium">Treinadores</span>
                              </Label>
                              <Label 
                                htmlFor="programs" 
                                className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all flex-1 ${
                                  searchType === 'programs' 
                                    ? 'border-brand bg-brand/5' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <RadioGroupItem value="programs" id="programs" />
                                <span className="text-sm font-medium">Programas</span>
                              </Label>
                            </RadioGroup>
                          </div>

                          {/* Sports Multi-Select */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-800 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              Modalidades esportivas
                              {selectedSports.length > 0 && (
                                <Badge variant="secondary" className="text-xs ml-auto">
                                  {selectedSports.length}
                                </Badge>
                              )}
                            </Label>
                            <Popover open={sportsOpen} onOpenChange={setSportsOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={sportsOpen}
                                  className={`w-full justify-between h-11 border-2 transition-colors ${
                                    selectedSports.length > 0 
                                      ? 'border-blue-500 bg-blue-50' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {selectedSports.length === 0 
                                    ? "Escolha as modalidades..." 
                                    : selectedSports.slice(0, 2).join(', ') + (selectedSports.length > 2 ? ` +${selectedSports.length - 2}` : '')
                                  }
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full max-w-sm p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Buscar modalidade..." />
                                  <CommandList>
                                    <CommandEmpty>Nenhuma modalidade encontrada.</CommandEmpty>
                                    <CommandGroup>
                                      {availableSports.map((sport) => (
                                        <CommandItem
                                          key={sport}
                                          onSelect={() => {
                                            setSelectedSports(prev => 
                                              prev.includes(sport) 
                                                ? prev.filter(s => s !== sport)
                                                : [...prev, sport]
                                            );
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${
                                              selectedSports.includes(sport) ? "opacity-100 text-blue-500" : "opacity-0"
                                            }`}
                                          />
                                          {sport}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            
                            {/* Selected Sports Tags */}
                            {selectedSports.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedSports.map((sport) => (
                                  <Badge key={sport} variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    {sport}
                                    <X 
                                      className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                                      onClick={() => setSelectedSports(prev => prev.filter(s => s !== sport))}
                                    />
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4 sm:space-y-5">
                          {/* Training Mode */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-800 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Modalidade de treino
                            </Label>
                            <div className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                              !isOnline ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-center gap-3">
                                <MapPin className={`h-5 w-5 ${!isOnline ? 'text-green-600' : 'text-gray-400'}`} />
                                <div>
                                  <span className="text-sm font-medium">{isOnline ? 'Online' : 'Presencial'}</span>
                                  <p className="text-xs text-gray-500">
                                    {isOnline ? 'Treinos remotos' : 'Treinos locais'}
                                  </p>
                                </div>
                              </div>
                              <Switch
                                checked={isOnline}
                                onCheckedChange={setIsOnline}
                                className="data-[state=checked]:bg-blue-500"
                              />
                            </div>
                          </div>

                          {/* Cities Multi-Select (conditional) */}
                          {!isOnline && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                              <Label className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                Cidades disponíveis
                                {selectedCities.length > 0 && (
                                  <Badge variant="secondary" className="text-xs ml-auto">
                                    {selectedCities.length}
                                  </Badge>
                                )}
                              </Label>
                              <Popover open={citiesOpen} onOpenChange={setCitiesOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={citiesOpen}
                                    className={`w-full justify-between h-11 border-2 transition-colors ${
                                      selectedCities.length > 0 
                                        ? 'border-purple-500 bg-purple-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    {selectedCities.length === 0 
                                      ? "Escolha as cidades..." 
                                      : selectedCities.slice(0, 2).join(', ') + (selectedCities.length > 2 ? ` +${selectedCities.length - 2}` : '')
                                    }
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full max-w-sm p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Buscar cidade..." />
                                    <CommandList>
                                      <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                                      <CommandGroup>
                                        {availableCities.map((city) => (
                                          <CommandItem
                                            key={city}
                                            onSelect={() => {
                                              setSelectedCities(prev => 
                                                prev.includes(city) 
                                                  ? prev.filter(c => c !== city)
                                                  : [...prev, city]
                                              );
                                            }}
                                            className="cursor-pointer"
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${
                                                selectedCities.includes(city) ? "opacity-100 text-purple-500" : "opacity-0"
                                              }`}
                                            />
                                            {city}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              
                              {/* Selected Cities Tags */}
                              {selectedCities.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {selectedCities.map((city) => (
                                    <Badge key={city} variant="secondary" className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200">
                                      {city}
                                      <X 
                                        className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                                        onClick={() => setSelectedCities(prev => prev.filter(c => c !== city))}
                                      />
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Treinadores em destaque</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'João Silva', specialty: 'Personal Trainer', rating: '4.9' },
                      { name: 'Maria Santos', specialty: 'Yoga & Pilates', rating: '4.8' },
                      { name: 'Carlos Oliveira', specialty: 'Crossfit', rating: '4.9' }
                    ].map((trainer) => (
                      <button
                        key={trainer.name}
                        className="flex items-center w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                        onClick={() => {
                          navigation.navigateToTrainer('1');
                          setIsSearchOpen(false);
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mr-3"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{trainer.name}</div>
                          <div className="text-sm text-gray-500">{trainer.specialty} • ⭐ {trainer.rating}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Search Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button 
                    onClick={clearAllFilters}
                    variant="outline" 
                    className="flex-1 hover:bg-gray-50 transition-colors"
                    disabled={!hasActiveFilters}
                  >
                    Limpar filtros
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Apply filters:', { searchType, selectedSports, isOnline, selectedCities });
                      setIsSearchOpen(false);
                    }}
                    size="lg"
                    className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 flex-1 shadow-lg hover:shadow-xl"
                  >
                    Buscar {hasActiveFilters && `(${activeFiltersCount})`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar?.url || user.avatar} alt={user.name} />
                      <AvatarFallback className="text-sm">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium hidden lg:inline">{user.name || 'Usuário'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* User Info */}
                  <div className="px-3 py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar?.url || user.avatar} alt={user.name} />
                        <AvatarFallback className="text-sm">
                          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name || 'Usuário'}</p>
                        <p className="text-sm text-muted-foreground">{user.email || ''}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {user.roles?.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type === 'trainer' ? 'Treinador' : 'Cliente'}
                        </Badge>
                      )) || null}
                    </div>
                  </div>
                  
                  {/* Dashboard Links */}
                  {user.roles?.includes('trainer') && (
                    <DropdownMenuItem onClick={() => navigation.navigateToTrainerDashboard()}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard Treinador
                    </DropdownMenuItem>
                  )}
                  {user.roles?.includes('client') && (
                    <DropdownMenuItem onClick={() => navigation.navigateToClientDashboard()}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard Cliente
                    </DropdownMenuItem>
                  )}
                  
                  {/* Additional Options */}
                  <DropdownMenuSeparator />
                  
                  {/* Become options for users who are not yet trainer/client */}
                  {!user.roles?.includes('trainer') && (
                    <DropdownMenuItem onClick={() => navigation.navigateToBecomeTrainer()}>
                      <Zap className="h-4 w-4 mr-2" />
                      Tornar-se Treinador
                    </DropdownMenuItem>
                  )}
                  {!user.roles?.includes('client') && (
                    <DropdownMenuItem onClick={() => navigation.navigateToBecomeClient()}>
                      <User className="h-4 w-4 mr-2" />
                      Tornar-se Cliente
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => console.log('Navigate to settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutAndRedirect()} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Demo Button (apenas para desenvolvimento) */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigation.navigateToCustom('/auth-demo')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                🔐 Demo Auth
              </Button>
              
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setLoginModalOpen(true)}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
              <Button 
                onClick={() => {
                  if (isAuthenticated && user?.roles?.includes('trainer')) {
                    navigation.navigateToTrainerDashboard();
                  } else {
                    navigation.navigateToBecomeTrainer();
                  }
                }}
                variant="brand"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isAuthenticated && user?.roles?.includes('trainer') ? 'Meu Dashboard' : 'Seja um treinador'}
              </Button>
            </>
          )}
        </div>

        {/* Botão do menu mobile */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-gray-900"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <div className="container py-4 space-y-4">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar treinadores, modalidades..."
                    className="pl-10 bg-gray-50 border-gray-200 cursor-pointer"
                    readOnly
                  />
                  {hasActiveFilters && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="h-5 text-xs bg-brand text-brand-foreground">
                        {activeFiltersCount}
                      </Badge>
                    </div>
                  )}
                </div>
              </DialogTrigger>
            </Dialog>

            <div className="space-y-2">
              <button
                onClick={() => {
                  navigation.navigateToCatalog();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Treinadores
              </button>
              <button
                onClick={() => {
                  navigation.navigateToCatalog();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Programas
              </button>
              <button
                onClick={() => {
                  navigation.navigateToCatalog();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Modalidades
              </button>
            </div>

            <div className="border-t pt-4 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar?.url || user.avatar} alt={user.name} />
                        <AvatarFallback className="text-sm">
                          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.name || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground">{user.email || ''}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {user.roles?.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type === 'trainer' ? 'Treinador' : 'Cliente'}
                        </Badge>
                      )) || null}
                    </div>
                  </div>

                  {user.roles?.includes('trainer') && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        navigation.navigateToTrainerDashboard();
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard Treinador
                    </Button>
                  )}
                  {user.roles?.includes('client') && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        navigation.navigateToClientDashboard();
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard Cliente
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      logoutAndRedirect();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                  <Button
                    onClick={() => {
                      navigation.navigateToBecomeTrainer();
                      setIsMenuOpen(false);
                    }}
                    variant="brand"
                    className="w-full justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Seja um treinador
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Modal de login */}
    <LoginModal
      isOpen={loginModalOpen}
      onClose={() => setLoginModalOpen(false)}
    />
    </>
  );
}