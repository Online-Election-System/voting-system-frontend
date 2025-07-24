// components/StandaloneDatePicker.tsx
'use client'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface StandaloneDatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  label: string
  className?: string
}

export function StandaloneDatePicker({
  date,
  setDate,
  label,
  className,
}: StandaloneDatePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <label>{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            disabled={{ 
              after: new Date(), 
              before: new Date(new Date().setFullYear(new Date().getFullYear() - 120)) 
            }}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}