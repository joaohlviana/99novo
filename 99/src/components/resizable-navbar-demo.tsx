"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./ui/resizable-navbar";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check, MapPin, Settings, ChevronUp } from 'lucide-react';
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

export default function NavbarDemo() {
  const navItems = [
    {
      name: "Sobre",
      link: "#about",
    },
    {
      name: "Como funciona",
      link: "#how-it-works",
    },
    {
      name: "Contato",
      link: "#contact",
    },
  ];

  // Explore dropdown options
  const exploreOptions = [
    {
      title: "Treinadores",
      description: "Encontre o personal trainer ideal para seus objetivos",
      onClick: () => console.log("Navigate to trainers"),
    },
    {
      title: "Programas",
      description: "Descubra programas de treino personalizados",
      onClick: () => console.log("Navigate to programs"),
    },
    {
      title: "Modalidades",
      description: "Explore diferentes tipos de exercícios e esportes",
      onClick: () => console.log("Navigate to sports"),
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  
  // Ref for explore dropdown
  const exploreRef = useRef<HTMLDivElement>(null);

  // Close explore dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setIsExploreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [searchType, setSearchType] = useState<'trainers' | 'programs'>('trainers');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);

  // Available options
  const availableSports = [
    'Musculação', 'Crossfit', 'Yoga', 'Pilates', 'Funcional', 
    'Corrida', 'Natação', 'Ciclismo', 'Boxe', 'Jiu-Jitsu',
    'Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Dança'
  ];

  const availableCities = [
    'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG',
    'Salvador - BA', 'Brasília - DF', 'Curitiba - PR', 'Recife - PE',
    'Porto Alegre - RS', 'Fortaleza - CE', 'Goiânia - GO'
  ];

  // Filter calculations
  const activeFiltersCount = [
    searchType !== 'trainers' ? 1 : 0,
    selectedSports.length,
    !isOnline ? 1 : 0,
    selectedCities.length
  ].reduce((sum, count) => sum + count, 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const clearAllFilters = () => {
    setSearchType('trainers');
    setSelectedSports([]);
    setIsOnline(true);
    setSelectedCities([]);
  };

  // Explore Dropdown Component
  const ExploreDropdown = ({ className = "", isMobile = false }: { className?: string; isMobile?: boolean }) => (
    <div className={`relative ${className}`} ref={!isMobile ? exploreRef : undefined}>
      <Button
        variant="ghost"
        onClick={() => setIsExploreOpen(!isExploreOpen)}
        className={`flex items-center space-x-1 text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 ${
          isMobile ? 'w-full justify-start py-2 px-2' : ''
        }`}
      >
        <span>Explorar</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isExploreOpen && (
        <div className={`${
          isMobile 
            ? 'mt-2 w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700' 
            : 'absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[200]'
        } py-2`}>
          {exploreOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsExploreOpen(false);
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isMobile ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">{option.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Search Bar Component
  const SearchBar = ({ className = "" }: { className?: string }) => (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogTrigger asChild>
        <div className={`relative ${className}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar treinadores, modalidades..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#e0093e] cursor-pointer"
              readOnly
            />
            {/* Active filters indicator */}
            {hasActiveFilters && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="h-5 text-xs bg-[#e0093e] text-white">
                  {activeFiltersCount}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
              className="pl-12 text-lg h-12 border-2 focus:border-[#e0093e] transition-colors"
              autoFocus
            />
          </div>

          {/* Smart Filters Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Filtros Inteligentes</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="bg-[#e0093e] text-white text-xs">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Search Type */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#e0093e]"></div>
                        Estou procurando por
                      </Label>
                      <RadioGroup 
                        value={searchType} 
                        onValueChange={(value: 'trainers' | 'programs') => setSearchType(value)}
                        className="flex gap-4"
                      >
                        <Label 
                          htmlFor="trainers-search" 
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            searchType === 'trainers' 
                              ? 'border-[#e0093e] bg-[#e0093e]/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <RadioGroupItem value="trainers" id="trainers-search" />
                          <span className="text-sm font-medium">Treinadores</span>
                        </Label>
                        <Label 
                          htmlFor="programs-search" 
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            searchType === 'programs' 
                              ? 'border-[#e0093e] bg-[#e0093e]/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <RadioGroupItem value="programs" id="programs-search" />
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
                        <PopoverContent className="w-full p-0" align="start">
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
                  <div className="space-y-5">
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
                          <PopoverContent className="w-full p-0" align="start">
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
          <div className="flex gap-3 pt-4 border-t">
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
              className="flex-1 bg-[#e0093e] hover:bg-[#c0082e] transition-colors shadow-lg hover:shadow-xl"
            >
              Buscar {hasActiveFilters && `(${activeFiltersCount})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          
          {/* Search Bar - Desktop */}
          <SearchBar className="hidden lg:block min-w-[300px] max-w-lg flex-1 mx-6" />
          
          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center space-x-6">
            <ExploreDropdown />
            
          </div>
          
          <div className="flex items-center gap-4">
            <NavbarButton variant="secondary">Entrar</NavbarButton>
            <NavbarButton variant="primary">Seja um treinador</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileMenuOpen) setIsExploreOpen(false);
              }}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => {
              setIsMobileMenuOpen(false);
              setIsExploreOpen(false);
            }}
          >
            {/* Mobile Search */}
            <div className="w-full mb-4">
              <SearchBar className="w-full" />
            </div>
            
            {/* Mobile Explore Dropdown */}
            <div className="w-full mb-2">
              <ExploreDropdown isMobile={true} className="w-full" />
            </div>
            
            {/* Navigation Links */}
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300 py-2 px-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span className="block font-medium">{item.name}</span>
              </a>
            ))}
            
            {/* Action Buttons */}
            <div className="flex w-full flex-col gap-3 pt-4 border-t">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
              >
                Entrar
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Seja um treinador
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      <DummyContent />

      {/* Navbar */}
    </div>
  );
}

const DummyContent = () => {
  return (
    <div className="container mx-auto p-8 pt-24">
      <h1 className="mb-4 text-center text-3xl font-bold">
        Demo da Navbar Responsiva
      </h1>
      <p className="mb-10 text-center text-sm text-zinc-500">
        Esta navbar se adapta ao scroll da página, ficando{" "}
        <span className="font-medium">compacta</span> quando você rola para baixo.
        O design é <span className="font-medium">totalmente responsivo</span> com
        menu mobile e animações suaves.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            id: 1,
            title: "Treinadores",
            subtitle: "Especialistas",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            textColor: "text-blue-700 dark:text-blue-300",
          },
          {
            id: 2,
            title: "Programas de Treino",
            subtitle: "Personalizados",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-green-50 dark:bg-green-900/20",
            textColor: "text-green-700 dark:text-green-300",
          },
          {
            id: 3,
            title: "Modalidades",
            subtitle: "Diversas",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            textColor: "text-purple-700 dark:text-purple-300",
          },
          {
            id: 4,
            title: "Conecte-se com seu treinador ideal",
            subtitle: "Encontre o profissional perfeito para seus objetivos",
            width: "md:col-span-3",
            height: "h-60",
            bg: "bg-red-50 dark:bg-red-900/20",
            textColor: "text-red-700 dark:text-red-300",
          },
          {
            id: 5,
            title: "Online",
            subtitle: "Flexível",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            textColor: "text-indigo-700 dark:text-indigo-300",
          },
          {
            id: 6,
            title: "Acompanhamento",
            subtitle: "Personalizado",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            textColor: "text-yellow-700 dark:text-yellow-300",
          },
          {
            id: 7,
            title: "Transformação",
            subtitle: "Real",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-teal-50 dark:bg-teal-900/20",
            textColor: "text-teal-700 dark:text-teal-300",
          },
          {
            id: 8,
            title: "99coach",
            subtitle: "A evolução do fitness",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-pink-50 dark:bg-pink-900/20",
            textColor: "text-pink-700 dark:text-pink-300",
          },
          {
            id: 9,
            title: "Sua jornada fitness começa aqui",
            subtitle: "Profissionais certificados esperando por você",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            textColor: "text-orange-700 dark:text-orange-300",
          },
          {
            id: 10,
            title: "Comece hoje",
            subtitle: "Transforme-se",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-emerald-700 dark:text-emerald-300",
          },
        ].map((box) => (
          <div
            key={box.id}
            className={`${box.width} ${box.height} ${box.bg} flex flex-col items-center justify-center rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <h2 className={`text-xl font-bold mb-2 text-center ${box.textColor}`}>{box.title}</h2>
            <p className={`text-sm text-center opacity-80 ${box.textColor}`}>{box.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};