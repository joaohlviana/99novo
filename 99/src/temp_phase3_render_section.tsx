          {/* 🚀 FASE 3: RENDERIZAÇÃO DE CONTEÚDO COM LOADING ESPECÍFICO */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
            {/* 🎯 LOADING ESPECÍFICO POR TIPO DE CONTEÚDO */}
            {contentType === 'trainers' ? (
              <>
                {/* Header Treinadores */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {isLoadingTrainers ? 'Carregando treinadores...' : `${trainersCount} treinadores encontrados`}
                    </h2>
                    {!isLoadingTrainers && (
                      <p className="text-muted-foreground">
                        {hasActiveTrainerFilters ? 'Resultados filtrados' : 'Mostrando todos os resultados'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid Treinadores */}
                {isLoadingTrainers ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <TrainerCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrainers.map((trainer) => (
                      <ModernProfileCard
                        key={trainer.id}
                        trainer={trainer}
                        onClick={() => handleTrainerClick(trainer)}
                      />
                    ))}
                  </div>
                )}

                {/* Empty state para treinadores */}
                {!isLoadingTrainers && filteredTrainers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhum treinador encontrado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os filtros para encontrar mais resultados.
                    </p>
                    <Button variant="outline" onClick={clearTrainerFilters}>
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Header Programas */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {isLoadingPrograms ? 'Carregando programas...' : `${programsCount} programas encontrados`}
                    </h2>
                    {!isLoadingPrograms && (
                      <p className="text-muted-foreground">
                        {hasActiveProgramFilters ? 'Resultados filtrados' : 'Mostrando todos os resultados'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid Programas */}
                {isLoadingPrograms ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <ProgramCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <ProgramsGrid
                    programs={filteredPrograms}
                    onProgramClick={(program) => {
                      console.log('🔗 Navegando para programa:', program.id);
                      navigateToProgram(program.id);
                    }}
                  />
                )}

                {/* Empty state para programas */}
                {!isLoadingPrograms && filteredPrograms.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhum programa encontrado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os filtros para encontrar mais resultados.
                    </p>
                    <Button variant="outline" onClick={clearProgramFilters}>
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* 🎉 INDICADOR DE BUSCA PARALELA CONCLUÍDA */}
            {dataLoaded && !isLoading && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  ✅ FASE 3: Dados carregados via busca paralela - {trainersCount} treinadores e {programsCount} programas em cache
                </p>
              </div>
            )}
          </div>