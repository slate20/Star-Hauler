
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
  CommandItem, // Added CommandItem to imports
  CommandList,
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
  value: string // The currently selected value
  onChange: (value: string) => void // Callback when value changes
  placeholder?: string
  emptyMessage?: string // Message when search yields no results
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
  const buttonRef = useRef<HTMLButtonElement>(null)

  // When popover opens, clear search query to show all options initially.
  useEffect(() => {
    if (open) {
      setSearchQuery("");
    }
  }, [open]);

  const selectedLabel = React.useMemo(() => {
    const selectedOption = options.find((option) => option.value === value)
    return selectedOption?.label || ""
  }, [options, value])

  // Enhanced CommandEmpty message logic
  const getEmptyMessage = () => {
    if (options.length === 0) {
      return "No options available.";
    }
    if (searchQuery) {
      return emptyMessage; // "No results found."
    }
    return "Type to search or select an option.";
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen && buttonRef.current) {
        // Return focus to trigger when popover closes, e.g. on Escape
        // This is handled by Radix Popover's default behavior if focus was inside.
      }
    }}>
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
            if (onFocus) {
              onFocus();
            }
          }}
          onFocus={() => {
            if (onFocus) {
              onFocus();
            }
          }}
        >
          {value ? selectedLabel : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]" // Match trigger width
        align="start" // Align to start of trigger
        sideOffset={4} // Default side offset
        onCloseAutoFocus={(event) => {
          // Prevent Radix from returning focus to body if we want to control it
          // For instance, return focus to the trigger button
          if (buttonRef.current) {
             // event.preventDefault(); // Only if overriding default Radix behavior
             // buttonRef.current.focus(); // This is often handled by Radix automatically
          }
        }}
      >
        <Command
          // cmdk will filter items based on CommandInput's value
          // The value prop on Command can be used for controlled selection,
          // but for a simple combobox, onSelect on CommandItem is often enough.
          // Add a general keydown handler for Escape if not handled by Popover
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setOpen(false);
              if (buttonRef.current) {
                buttonRef.current.focus();
              }
            }
          }}
        >
          <CommandInput
            autoFocus // Focus input when popover opens
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery} // Controlled input for search query
            onValueChange={setSearchQuery} // Update search query as user types
          />
          <CommandList className="max-h-60"> {/* Scrollable list area */}
            <CommandEmpty>{getEmptyMessage()}</CommandEmpty>
            <CommandGroup>
              {/* Render all options; cmdk filters based on CommandInput value (searchQuery) */}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value} // This value is used by cmdk for matching and selection
                  onSelect={(currentValue: string) => {
                    // currentValue is option.value of the selected item
                    // This is triggered by click or Enter on a cmdk-selected item
                    onChange(currentValue);
                    setOpen(false);
                    setSearchQuery(""); // Clear search query after selection
                    if (buttonRef.current) {
                      buttonRef.current.focus(); // Return focus to the trigger
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === option.value ? "opacity-100" : "opacity-0" // Show checkmark for the *final* selected value
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
