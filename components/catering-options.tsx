'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Utensils } from 'lucide-react'
import { CATERING_PRICES } from '@/lib/types'

interface CateringOptionsProps {
  onCateringUpdate: (catering: CateringData) => void
}

export interface CateringData {
  lunch: {
    included: boolean
    count: number
  }
  breakfast: {
    option: 'option1' | 'option2' | 'option3' | null
    count: number
  }
  coffeeBreak: {
    included: boolean
    count: number
  }
}

export const CateringOptions: React.FC<CateringOptionsProps> = ({ onCateringUpdate }) => {
  const [lunchCount, setLunchCount] = useState(0)
  const [breakfastOption, setBreakfastOption] = useState<'option1' | 'option2' | 'option3' | null>(null)
  const [breakfastCount, setBreakfastCount] = useState(0)
  const [coffeeBreakCount, setCoffeeBreakCount] = useState(0)

  const handleLunchChange = useCallback((checked: boolean) => {
    setLunchCount(checked ? 1 : 0)
  }, [])

  const handleLunchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number.parseInt(e.target.value) || 0)
    setLunchCount(value)
  }, [])

  const handleBreakfastOptionClick = useCallback((option: 'option1' | 'option2' | 'option3') => {
    setBreakfastOption(breakfastOption === option ? null : option)
  }, [breakfastOption])

  const handleBreakfastInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number.parseInt(e.target.value) || 0)
    setBreakfastCount(value)
  }, [])

  const handleCoffeeChange = useCallback((checked: boolean) => {
    setCoffeeBreakCount(checked ? 1 : 0)
  }, [])

  const handleCoffeeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number.parseInt(e.target.value) || 0)
    setCoffeeBreakCount(value)
  }, [])

  React.useEffect(() => {
    onCateringUpdate({
      lunch: {
        included: lunchCount > 0,
        count: lunchCount,
      },
      breakfast: {
        option: breakfastOption,
        count: breakfastCount,
      },
      coffeeBreak: {
        included: coffeeBreakCount > 0,
        count: coffeeBreakCount,
      },
    })
  }, [lunchCount, breakfastOption, breakfastCount, coffeeBreakCount, onCateringUpdate])

  const getBreakfastOptionClass = (option: string): string => {
    const base = 'p-3 border rounded-lg cursor-pointer transition-colors'
    const isSelected = breakfastOption === option
    const colors = isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
    return `${base} ${colors}`
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Utensils className='h-5 w-5' />
          Catering Options
        </CardTitle>
        <CardDescription>Select options for your event</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-3'>
          <Label className='text-base font-semibold flex items-center gap-2'>
            <Utensils className='h-4 w-4' />
            Lunch - 25000 FCFA
          </Label>
          <p className='text-sm text-muted-foreground'>Full meal: appetizer, main course and dessert</p>
          <div className='flex items-center gap-4'>
            <Checkbox id='lunch' checked={lunchCount > 0} onCheckedChange={handleLunchChange} />
            <Label htmlFor='lunch' className='cursor-pointer'>
              Include lunch
            </Label>
          </div>
          {lunchCount > 0 && (
            <div className='flex items-center gap-2 ml-6'>
              <Label htmlFor='lunch-count' className='text-sm'>
                Number of people:
              </Label>
              <Input
                id='lunch-count'
                type='number'
                min='1'
                value={lunchCount}
                onChange={handleLunchInputChange}
                className='w-20'
              />
              <span className='text-sm text-muted-foreground'>
                {(lunchCount * CATERING_PRICES.LUNCH).toLocaleString('en-US')} FCFA
              </span>
            </div>
          )}
        </div>

        <div className='space-y-3'>
          <Label className='text-base font-semibold flex items-center gap-2'>
            <Utensils className='h-4 w-4' />
            Breakfast
          </Label>
          <p className='text-sm text-muted-foreground'>Choose a breakfast option</p>

          <div className='space-y-2'>
            <div className={getBreakfastOptionClass('option1')} onClick={() => handleBreakfastOptionClick('option1')}>
              <div className='flex items-center gap-2'>
                <Checkbox id='breakfast-opt1' checked={breakfastOption === 'option1'} readOnly />
                <Label htmlFor='breakfast-opt1' className='cursor-pointer flex-1'>
                  Option 1 (6000 FCFA per person)
                </Label>
              </div>
              <p className='text-xs text-muted-foreground ml-6'>Coffee, juice, bread, butter, jam</p>
            </div>

            <div className={getBreakfastOptionClass('option2')} onClick={() => handleBreakfastOptionClick('option2')}>
              <div className='flex items-center gap-2'>
                <Checkbox id='breakfast-opt2' checked={breakfastOption === 'option2'} readOnly />
                <Label htmlFor='breakfast-opt2' className='cursor-pointer flex-1'>
                  Option 2 (9000 FCFA per person)
                </Label>
              </div>
              <p className='text-xs text-muted-foreground ml-6'>Option 1 plus eggs, cheese, cold cuts</p>
            </div>

            <div className={getBreakfastOptionClass('option3')} onClick={() => handleBreakfastOptionClick('option3')}>
              <div className='flex items-center gap-2'>
                <Checkbox id='breakfast-opt3' checked={breakfastOption === 'option3'} readOnly />
                <Label htmlFor='breakfast-opt3' className='cursor-pointer flex-1'>
                  Option 3 (12000 FCFA per person)
                </Label>
              </div>
              <p className='text-xs text-muted-foreground ml-6'>Option 2 plus fruit, yogurt, pastries</p>
            </div>
          </div>

          {breakfastOption && (
            <div className='flex items-center gap-2 ml-6 mt-3'>
              <Label htmlFor='breakfast-count' className='text-sm'>
                Number of people:
              </Label>
              <Input
                id='breakfast-count'
                type='number'
                min='1'
                value={breakfastCount}
                onChange={handleBreakfastInputChange}
                className='w-20'
              />
              <span className='text-sm text-muted-foreground'>
                {(() => {
                  const pricePerPerson =
                    breakfastOption === 'option1'
                      ? CATERING_PRICES.BREAKFAST_OPTION_1
                      : breakfastOption === 'option2'
                        ? CATERING_PRICES.BREAKFAST_OPTION_2
                        : CATERING_PRICES.BREAKFAST_OPTION_3
                  return (breakfastCount * pricePerPerson).toLocaleString('en-US')
                })()}{' '}
                FCFA
              </span>
            </div>
          )}
        </div>

        <div className='space-y-3'>
          <Label className='text-base font-semibold flex items-center gap-2'>
            <Utensils className='h-4 w-4' />
            Coffee Break - 3500 FCFA
          </Label>
          <p className='text-sm text-muted-foreground'>Coffee and light snacks</p>
          <div className='flex items-center gap-4'>
            <Checkbox id='coffee' checked={coffeeBreakCount > 0} onCheckedChange={handleCoffeeChange} />
            <Label htmlFor='coffee' className='cursor-pointer'>
              Include a coffee break
            </Label>
          </div>
          {coffeeBreakCount > 0 && (
            <div className='flex items-center gap-2 ml-6'>
              <Label htmlFor='coffee-count' className='text-sm'>
                Number of people:
              </Label>
              <Input
                id='coffee-count'
                type='number'
                min='1'
                value={coffeeBreakCount}
                onChange={handleCoffeeInputChange}
                className='w-20'
              />
              <span className='text-sm text-muted-foreground'>
                {(coffeeBreakCount * CATERING_PRICES.COFFEE_BREAK).toLocaleString('en-US')} FCFA
              </span>
            </div>
          )}
        </div>

        {(lunchCount > 0 || breakfastCount > 0 || coffeeBreakCount > 0) && (
          <div className='bg-linear-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200'>
            <div className='text-sm font-semibold text-gray-700'>
              Total catering: {(() => {
                const lunchTotal = lunchCount * CATERING_PRICES.LUNCH
                const breakfastPrice =
                  breakfastOption === 'option1'
                    ? CATERING_PRICES.BREAKFAST_OPTION_1
                    : breakfastOption === 'option2'
                      ? CATERING_PRICES.BREAKFAST_OPTION_2
                      : CATERING_PRICES.BREAKFAST_OPTION_3
                const breakfastTotal = breakfastCount * (breakfastOption ? breakfastPrice : 0)
                const coffeeTotal = coffeeBreakCount * CATERING_PRICES.COFFEE_BREAK
                const total = lunchTotal + breakfastTotal + coffeeTotal
                return total.toLocaleString('en-US')
              })()} FCFA
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
