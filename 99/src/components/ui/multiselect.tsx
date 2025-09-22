"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, XCircleIcon, XIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export interface Option {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  disable?: boolean
  /** fixed option that can't be removed. */
  fixed?: boolean
  [key: string]: string | boolean | React.ComponentType<{ className?: string }> | undefined
}

interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]
  /** manually controlled options */
  options?: Option[]
  placeholder?: string
  /** Loading component. */
  loadingIndicator?: React.ReactNode
  /** Empty component. */
  emptyIndicator?: React.ReactNode
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number
  /**
   * Only work with `onSearch` prop. Trigger search when `onSearch` is defined and input value change.
   * Debounce time defaults to 500ms.
   */
  onSearch?: (value: string) => Promise<Option[]>
  /**
   * async search
   */
  /**
   * sync search
   */
  onSearchSync?: (value: string) => Option[]
  onChange?: (options: Option[]) => void
  /** Limit the maximum number of selected options. */
  maxSelected?: number
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean
  /** Group the options base on provided key. */
  groupBy?: string
  className?: string
  badgeClassName?: string
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>
  /** Props of `CommandInput` */
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandInput>
  /** hide the clear all button. */
  hideClearAllButton?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {}
  }
  if (!groupBy) {
    return {
      "": options,
    }
  }

  const groupOption: Record<string, Option[]> = {}
  options.forEach((option) => {
    const key = (option[groupBy] as string) || ""
    if (!groupOption[key]) {
      groupOption[key] = []
    }
    groupOption[key].push(option)
  })
  return groupOption
}

function removePickedOption(groupOption: Record<string, Option[]>, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as Record<string, Option[]>

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter((val) => !picked.find((p) => p.value === val.value))
  }
  return cloneOption
}

function isOptionsExist(groupOption: Record<string, Option[]>, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    ) {
      return true
    }
  }
  return false
}

/**
 * The `MultipleSelector` component allows users to select multiple options from a list.
 * It supports async search, option grouping, and customization.
 */
const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [onScrollbar, setOnScrollbar] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const [selected, setSelected] = React.useState<Option[]>(value || [])
    const [options, setOptions] = React.useState<Record<string, Option[]>>(
      transToGroupOption(arrayDefaultOptions, groupBy),
    )
    const [inputValue, setInputValue] = React.useState("")
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500)

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef?.current?.focus(),
        reset: () => setSelected([]),
      }),
      [selected],
    )

    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value)
        setSelected(newOptions)
        onChange?.(newOptions)
      },
      [onChange, selected],
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1]
              // If last option is fixed, we don't remove it.
              if (!lastSelectOption.fixed) {
                handleUnselect(lastSelectOption)
              }
            }
          }
          // This is not a default behavior of the <input /> field
          if (e.key === "Escape") {
            input.blur()
          }
        }
      },
      [handleUnselect, selected],
    )

    React.useEffect(() => {
      if (value) {
        setSelected(value)
      }
    }, [value])

    React.useEffect(() => {
      /** If `onSearch` is provided, do not trigger options updated. */
      if (!arrayOptions || onSearch) {
        return
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy)
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption)
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options])

    React.useEffect(() => {
      /** sync search */

      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm)
        setOptions(transToGroupOption(res || [], groupBy))
      }

      const exec = async () => {
        if (!onSearchSync || !open) return

        if (onSearch) {
          return
        }

        doSearchSync()
      }

      void exec()
    }, [debouncedSearchTerm, groupBy, onSearch, onSearchSync, open])

    React.useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true)
        const res = await onSearch?.(debouncedSearchTerm)
        setOptions(transToGroupOption(res || [], groupBy))
        setIsLoading(false)
      }

      const exec = async () => {
        if (!onSearch || !open) return

        if (onSearchSync) {
          return
        }

        await doSearch()
      }

      void exec()
    }, [debouncedSearchTerm, groupBy, onSearch, onSearchSync, open])

    const CreatableItem = () => {
      if (!creatable) return undefined
      if (
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return undefined
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length)
              return
            }
            setInputValue("")
            const newOptions = [...selected, { value, label: value }]
            setSelected(newOptions)
            onChange?.(newOptions)
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      )

      // For normal creatable
      if (!onSearch && inputValue.length > 0) {
        return Item
      }

      // For async search creatable. avoid showing creatable item before loading at first.
      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item
      }

      return undefined
    }

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined

      // For async search that showing emptyIndicator
      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        )
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>
    }, [creatable, emptyIndicator, onSearch, options])

    const selectables = React.useMemo<Record<string, Option[]>>(
      () => removePickedOption(options, selected),
      [options, selected],
    )

    /** Avoid Creatable Selector freezing or lagging when paste a long string. */
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter
      }

      if (creatable) {
        return (value: string, search: string) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
        }
      }
      // Using default filter in `cmdk`. We don't have to provide it.
      return undefined
    }, [creatable, commandProps?.filter])

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={dropdownRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit hover:bg-inherit focus:ring-2 focus:ring-ring focus:ring-offset-2",
              className,
            )}
            onClick={() => setOpen(!open)}
            onMouseLeave={() => setOnScrollbar(false)}
            disabled={disabled}
          >
            {selected.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center gap-1">
                  {selected.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <Badge
                        key={option.value}
                        className={cn(
                          "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                          "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                          badgeClassName,
                        )}
                        data-fixed={option.fixed}
                        data-disabled={disabled || undefined}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 mr-2" />
                        )}
                        {option.label}
                        {!option.fixed && (
                          <button
                            className={cn(
                              "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                              (disabled || option.fixed) && "hidden",
                            )}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUnselect(option)
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onClick={() => handleUnselect(option)}
                          >
                            <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                      </Badge>
                    )
                  })}
                </div>
                {!hideClearAllButton && !disabled && selected.length > 0 && (
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelected(selected.filter((s) => s.fixed))
                        onChange?.(selected.filter((s) => s.fixed))
                      }}
                    >
                      <XCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-muted-foreground mx-3">
                  {hidePlaceholderWhenSelected && selected.length > 0 ? "" : placeholder}
                </span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 drop-shadow-sm"
          style={{
            width: dropdownRef?.current?.clientWidth,
          }}
          align="start"
          onEscapeKeyDown={() => {
            inputRef.current?.blur()
          }}
        >
          <Command
            {...commandProps}
            onKeyDown={(e) => {
              handleKeyDown(e)
              commandProps?.onKeyDown?.(e)
            }}
            className={cn("h-full", commandProps?.className)}
            filter={commandFilter()}
          >
            {!onScrollbar && (
              <CommandInput
                {...inputProps}
                ref={inputRef}
                value={inputValue}
                onValueChange={(value) => {
                  setInputValue(value)
                  inputProps?.onValueChange?.(value)
                }}
                onBlur={(event) => {
                  if (!onScrollbar) {
                    setOpen(false)
                  }
                  inputProps?.onBlur?.(event)
                }}
                onFocus={(event) => {
                  setOpen(true)
                  inputProps?.onFocus?.(event)
                }}
                placeholder={placeholder}
                className={cn("text-sm", inputProps?.className)}
              />
            )}
            <CommandList
              onMouseEnter={() => setOnScrollbar(true)}
              onMouseLeave={() => setOnScrollbar(false)}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  <EmptyItem />
                  <CreatableItem />
                  {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                      <>
                        {dropdowns.map((option) => {
                          const IconComponent = option.icon
                          return (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disable}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onSelect={() => {
                                if (selected.length >= maxSelected) {
                                  onMaxSelected?.(selected.length)
                                  return
                                }
                                setInputValue("")
                                const newOptions = [...selected, option]
                                setSelected(newOptions)
                                onChange?.(newOptions)
                              }}
                              className={cn(
                                "cursor-pointer",
                                option.disable &&
                                  "cursor-default text-muted-foreground opacity-50",
                              )}
                            >
                              {IconComponent && (
                                <IconComponent className="h-4 w-4 mr-2" />
                              )}
                              {option.label}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selected.find((item) => item.value === option.value)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          )
                        })}
                      </>
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)

MultipleSelector.displayName = "MultipleSelector"

export default MultipleSelector