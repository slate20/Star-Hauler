"use client"

import React from 'react'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Control } from 'react-hook-form'

interface FormComboboxProps {
  name: string
  control: Control<any>
  options: ComboboxOption[]
  label?: string
  placeholder?: string
  emptyMessage?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export function FormCombobox({
  name,
  control,
  options,
  label,
  placeholder,
  emptyMessage,
  icon,
  disabled,
}: FormComboboxProps) {
  // Track if the field has been interacted with
  const [isTouched, setIsTouched] = React.useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Ensure we have a string value for the combobox
        const value = field.value?.toString() || "";
        
        return (
          <FormItem className="flex-grow">
            {label && <FormLabel className="text-base">{label}</FormLabel>}
            <FormControl>
              <div className="flex items-center">
                {icon && <div className="mr-2 text-muted-foreground">{icon}</div>}
                <Combobox
                  value={value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                    // Trigger onBlur to ensure form validation runs
                    field.onBlur();
                    setIsTouched(true);
                  }}
                  options={options}
                  placeholder={placeholder}
                  emptyMessage={emptyMessage}
                  disabled={disabled}
                  className="text-base"
                  onFocus={() => {
                    // The dropdown will open automatically on focus
                    // The focus handler is now handled in the Combobox component
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  )
}
