"use client"

import { Input } from "@/registry/ui/input"
import { Checkbox } from "@/registry/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/registry/ui/radio-group"
import { Label } from "@/registry/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select"
import { Textarea } from "@/registry/ui/textarea"

export function FormShowcase() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Text Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Enter your full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="you@agency.gov" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Enter your message" rows={3} />
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Select a state</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dc">District of Columbia</SelectItem>
              <SelectItem value="md">Maryland</SelectItem>
              <SelectItem value="va">Virginia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Notification preference</Label>
          <RadioGroup defaultValue="email">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="email" id="r1" />
              <Label htmlFor="r1" className="font-normal">Email</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="sms" id="r2" />
              <Label htmlFor="r2" className="font-normal">SMS</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="none" id="r3" />
              <Label htmlFor="r3" className="font-normal">None</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Agreements</Label>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="font-normal">
              I agree to the terms and conditions
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="updates" defaultChecked />
            <Label htmlFor="updates" className="font-normal">
              Send me updates about my application
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
