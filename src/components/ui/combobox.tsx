
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useRef } from "react"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  onFocus?: () => void
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  onFocus,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    
    const query = searchQuery.toLowerCase();
    return options.filter((option) => {
      const label = option.label.toLowerCase();
      const value = option.value.toLowerCase();
      
      // Check if the query matches any part of the label or value
      return label.includes(query) || value.includes(query);
    });
  }, [options, searchQuery])
  
  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Open the dropdown when the user starts typing
    if (query && !open) {
      setOpen(true);
    }
  }

  // Find the selected option label
  const selectedLabel = React.useMemo(() => {
    const selectedOption = options.find((option) => option.value === value)
    return selectedOption?.label || ""
  }, [options, value])
  
  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredOptions])

  // Auto-select first item when options change
  useEffect(() => {
    if (open && filteredOptions.length > 0 && inputRef.current) {
      // Focus the input and set aria-activedescendant to the first item
      inputRef.current.focus()
    }
  }, [open, filteredOptions])
  
  // Handle keyboard selection
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredOptions.length === 0) return

    // Handle arrow up/down for navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
    } else if (e.key === 'Enter') {
      // Select the highlighted item when Enter is pressed
      e.preventDefault()
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value)
      }
      setOpen(false)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between", 
            open ? "ring-2 ring-ring ring-offset-1" : "",
            className
          )}
          disabled={disabled}
          onClick={() => {
            setOpen(true);
            // Focus the input when dropdown is opened
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
                // Call onFocus handler if provided
                if (onFocus) {
                  onFocus();
                }
              }
            }, 0);
          }}
          onFocus={() => {
            // Call onFocus handler if provided
            if (onFocus) {
              onFocus();
            }
          }}
        >
          {value ? selectedLabel : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput 
            ref={inputRef}
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            onValueChange={handleSearchChange}
            value={searchQuery}
            autoFocus
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue: string) => {
                  onChange(currentValue)
                  setOpen(false)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                aria-selected={highlightedIndex === index}
                className={cn(
                  // Highlighted item (keyboard navigation or mouse hover)
                  // This is handled by aria-selected in base CommandItem now
                  // Selected item visual distinction (checkmark) is handled below
                  value === option.value && "font-medium" // Keep for checkmark logic consistency
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-primary", // Checkmark uses primary color
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
