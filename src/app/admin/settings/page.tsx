'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    advancePaymentPercent: 20,
    whatsappApiKey: '',
    stripePublicKey: ''
  })

  const [loading, setLoading] = useState(true)
  const [paymentOption, setPaymentOption] = useState<'full' | '10' | '50' | 'custom'>('custom')
  const [customAdvancePercent, setCustomAdvancePercent] = useState<number>(20)

  type Service = { id: string; name: string; description?: string | null; price: number; duration: number; active: boolean }
  const [services, setServices] = useState<Service[]>([])
  const [showInactive, setShowInactive] = useState(false)
  const [newService, setNewService] = useState<{ name: string; description: string; price: string; duration: string; active: boolean }>({
    name: '', description: '', price: '', duration: '', active: true,
  })
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editedService, setEditedService] = useState<{ name: string; description: string; price: string; duration: string; active: boolean } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load settings')
        const b = json.business
        const s = json.settings
        setSettings(prev => ({
          ...prev,
          businessName: b?.name || '',
          businessEmail: b?.email || '',
          businessPhone: b?.phone || '',
          businessAddress: b?.address || '',
          workingHoursStart: s?.workingHoursStart || prev.workingHoursStart,
          workingHoursEnd: s?.workingHoursEnd || prev.workingHoursEnd,
          advancePaymentPercent: s?.advancePaymentPercent ?? prev.advancePaymentPercent,
        }))
        const pct = s?.advancePaymentPercent ?? 20
        if (pct === 100) setPaymentOption('full')
        else if (pct === 10) setPaymentOption('10')
        else if (pct === 50) setPaymentOption('50')
        else { setPaymentOption('custom'); setCustomAdvancePercent(pct) }
      } catch (e: any) {
        console.error(e)
        toast.error(e.message || 'Failed to load settings')
      }

      try {
        const res = await fetch(`/api/admin/services?includeInactive=true`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load services')
        setServices(json)
      } catch (e: any) {
        console.error(e)
        toast.error(e.message || 'Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleInputChange = (field: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const advancePercent = paymentOption === 'full' ? 100 : paymentOption === '10' ? 10 : paymentOption === '50' ? 50 : Math.round(customAdvancePercent)
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.businessName,
          email: settings.businessEmail,
          phone: settings.businessPhone,
          address: settings.businessAddress,
          workingHoursStart: settings.workingHoursStart,
          workingHoursEnd: settings.workingHoursEnd,
          advancePaymentPercent: advancePercent,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save settings')
      toast.success('Settings saved')
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings')
    }
  }

  const handleApplyPayment = async () => {
    try {
      const advancePercent = paymentOption === 'full' ? 100 : paymentOption === '10' ? 10 : paymentOption === '50' ? 50 : Math.round(customAdvancePercent)
      if (advancePercent < 0 || advancePercent > 100) {
        toast.error('Advance percentage must be between 0 and 100')
        return
      }
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advancePaymentPercent: advancePercent })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update payment settings')
      setSettings(prev => ({ ...prev, advancePaymentPercent: advancePercent }))
      toast.success('Payment settings applied')
    } catch (e: any) {
      toast.error(e.message || 'Failed to update payment settings')
    }
  }

  const filteredServices = services.filter(s => showInactive ? true : s.active)

  const handleAddService = async () => {
    try {
      const priceNum = Number(newService.price)
      const durationNum = Number(newService.duration)
      if (!newService.name || newService.name.trim().length < 2) return toast.error('Service name must be at least 2 characters')
      if (!Number.isFinite(priceNum) || priceNum <= 0) return toast.error('Pricing must be a positive number')
      if (!Number.isInteger(durationNum) || durationNum <= 0) return toast.error('Duration must be a positive integer')

      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newService.name.trim(),
          description: newService.description?.trim(),
          price: priceNum,
          duration: durationNum,
          active: newService.active,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add service')
      setServices(prev => [json, ...prev])
      setNewService({ name: '', description: '', price: '', duration: '', active: true })
      toast.success('Service added')
    } catch (e: any) {
      toast.error(e.message || 'Failed to add service')
    }
  }

  const startEditService = (svc: Service) => {
    setEditingServiceId(svc.id)
    setEditedService({
      name: svc.name,
      description: svc.description || '',
      price: String(svc.price),
      duration: String(svc.duration),
      active: svc.active,
    })
  }

  const cancelEditService = () => {
    setEditingServiceId(null)
    setEditedService(null)
  }

  const saveEditService = async (id: string) => {
    if (!editedService) return
    try {
      const priceNum = Number(editedService.price)
      const durationNum = Number(editedService.duration)
      if (!editedService.name || editedService.name.trim().length < 2) return toast.error('Service name must be at least 2 characters')
      if (!Number.isFinite(priceNum) || priceNum <= 0) return toast.error('Pricing must be a positive number')
      if (!Number.isInteger(durationNum) || durationNum <= 0) return toast.error('Duration must be a positive integer')

      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedService.name.trim(),
          description: editedService.description?.trim(),
          price: priceNum,
          duration: durationNum,
          active: editedService.active,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update service')
      setServices(prev => prev.map(s => s.id === id ? json : s))
      cancelEditService()
      toast.success('Service updated')
    } catch (e: any) {
      toast.error(e.message || 'Failed to update service')
    }
  }

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete service')
      setServices(prev => prev.map(s => s.id === id ? { ...s, active: false } : s))
      toast.success('Service deleted')
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete service')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl">Loading settings...</h1>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Settings</h1>
        <p className="text-gray-600">Manage your business configuration and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Basic business details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" value={settings.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} placeholder="Enter business name" />
              </div>
              <div>
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input id="businessEmail" type="email" value={settings.businessEmail} onChange={(e) => handleInputChange('businessEmail', e.target.value)} placeholder="business@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input id="businessPhone" value={settings.businessPhone} onChange={(e) => handleInputChange('businessPhone', e.target.value)} placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input id="businessAddress" value={settings.businessAddress} onChange={(e) => handleInputChange('businessAddress', e.target.value)} placeholder="123 Main St, City, State" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>Set your business operating hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workingHoursStart">Start Time</Label>
                <Input id="workingHoursStart" type="time" value={settings.workingHoursStart} onChange={(e) => handleInputChange('workingHoursStart', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="workingHoursEnd">End Time</Label>
                <Input id="workingHoursEnd" type="time" value={settings.workingHoursEnd} onChange={(e) => handleInputChange('workingHoursEnd', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment processing and advance payment requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Option</Label>
                <Select value={paymentOption} onValueChange={(val) => setPaymentOption(val as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full payment upfront</SelectItem>
                    <SelectItem value="10">10% advance payment</SelectItem>
                    <SelectItem value="50">50% advance payment</SelectItem>
                    <SelectItem value="custom">Custom percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentOption === 'custom' && (
                <div>
                  <Label htmlFor="customAdvancePercent">Custom Percentage</Label>
                  <Input id="customAdvancePercent" type="number" min="0" max="100" value={customAdvancePercent} onChange={(e) => setCustomAdvancePercent(parseInt(e.target.value || '0'))} placeholder="Enter %" />
                  <p className="text-sm text-gray-500 mt-1">Percentage of total amount required as advance payment</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleApplyPayment}>Apply Payment Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Management */}
        <Card>
          <CardHeader>
            <CardTitle>Service Management</CardTitle>
            <CardDescription>Create, edit, delete and view services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Service */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Add New Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="svc-name">Service name</Label>
                  <Input id="svc-name" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. Premium Detail" />
                </div>
                <div>
                  <Label htmlFor="svc-price">Pricing</Label>
                  <Input id="svc-price" type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="e.g. 150" />
                </div>
                <div>
                  <Label htmlFor="svc-duration">Duration (minutes)</Label>
                  <Input id="svc-duration" type="number" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} placeholder="e.g. 180" />
                </div>
                <div>
                  <Label htmlFor="svc-desc">Description</Label>
                  <Input id="svc-desc" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} placeholder="Brief description" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddService}>Add Service</Button>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Services</h3>
                <div className="flex items-center gap-3">
                  <Label className="text-sm">View</Label>
                  <Select value={showInactive ? 'all' : 'active'} onValueChange={(v) => setShowInactive(v === 'all')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active only</SelectItem>
                      <SelectItem value="all">All (including inactive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Price</th>
                      <th className="text-left py-2 px-3">Duration</th>
                      <th className="text-left py-2 px-3">Active</th>
                      <th className="text-left py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No services found</td>
                      </tr>
                    ) : (
                      filteredServices.map((svc) => (
                        <tr key={svc.id} className="border-t">
                          <td className="py-2 px-3">
                            {editingServiceId === svc.id ? (
                              <Input value={editedService?.name || ''} onChange={(e) => setEditedService(prev => ({ ...(prev as any), name: e.target.value }))} />
                            ) : (
                              <span className="font-medium">{svc.name}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {editingServiceId === svc.id ? (
                              <Input type="number" value={editedService?.price || ''} onChange={(e) => setEditedService(prev => ({ ...(prev as any), price: e.target.value }))} />
                            ) : (
                              <span>${svc.price.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {editingServiceId === svc.id ? (
                              <Input type="number" value={editedService?.duration || ''} onChange={(e) => setEditedService(prev => ({ ...(prev as any), duration: e.target.value }))} />
                            ) : (
                              <span>{svc.duration} min</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {editingServiceId === svc.id ? (
                              <Select value={editedService?.active ? 'true' : 'false'} onValueChange={(v) => setEditedService(prev => ({ ...(prev as any), active: v === 'true' }))}>
                                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Active</SelectItem>
                                  <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className={svc.active ? 'text-green-600' : 'text-gray-500'}>{svc.active ? 'Active' : 'Inactive'}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {editingServiceId === svc.id ? (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveEditService(svc.id)}>Save</Button>
                                <Button size="sm" variant="secondary" onClick={cancelEditService}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => startEditService(svc)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteService(svc.id)}>Delete</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure third-party service integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatsappApiKey">WhatsApp API Key</Label>
              <Input id="whatsappApiKey" type="password" value={settings.whatsappApiKey} onChange={(e) => handleInputChange('whatsappApiKey', e.target.value)} placeholder="Enter WhatsApp API key" />
            </div>
            <div>
              <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
              <Input id="stripePublicKey" type="password" value={settings.stripePublicKey} onChange={(e) => handleInputChange('stripePublicKey', e.target.value)} placeholder="pk_..." />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button onClick={handleSave} className="px-8">Save Settings</Button>
        </div>
      </div>
    </div>
  )
}