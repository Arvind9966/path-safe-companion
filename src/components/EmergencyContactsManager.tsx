import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Phone } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  contact_type: string;
  address?: string;
  city: string;
  state?: string;
}

const EmergencyContactsManager = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    contact_type: 'family',
    address: '',
    city: '',
    state: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load emergency contacts",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone_number || !formData.city) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          ...formData,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Emergency contact added successfully"
      });

      setFormData({
        name: '',
        phone_number: '',
        contact_type: 'family',
        address: '',
        city: '',
        state: ''
      });
      setIsAdding(false);
      fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact deleted successfully"
      });
      fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-platinum">Emergency Contacts</h2>
          <p className="text-sm sm:text-base text-silver">Manage your emergency contacts for quick access</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="gradient-emerald hover:scale-105 transition-transform w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {isAdding && (
        <Card className="glass-panel border-0">
          <CardHeader>
            <CardTitle className="text-platinum">Add Emergency Contact</CardTitle>
            <CardDescription className="text-silver">
              Enter the details for your emergency contact
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-platinum text-sm sm:text-base">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input border-silver/20 text-platinum h-10 sm:h-11"
                    placeholder="Contact name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-platinum text-sm sm:text-base">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="glass-input border-silver/20 text-platinum h-10 sm:h-11"
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-platinum text-sm sm:text-base">Contact Type</Label>
                  <Select 
                    value={formData.contact_type} 
                    onValueChange={(value) => setFormData({ ...formData, contact_type: value })}
                  >
                    <SelectTrigger className="glass-input border-silver/20 text-platinum h-10 sm:h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="police">Police</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-platinum text-sm sm:text-base">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="glass-input border-silver/20 text-platinum h-10 sm:h-11"
                    placeholder="City"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-platinum text-sm sm:text-base">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="glass-input border-silver/20 text-platinum h-10 sm:h-11"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-platinum text-sm sm:text-base">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="glass-input border-silver/20 text-platinum h-10 sm:h-11"
                  placeholder="Full address"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="gradient-sapphire w-full sm:w-auto"
                >
                  {loading ? 'Adding...' : 'Add Contact'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAdding(false)}
                  className="border-silver/20 text-silver hover:bg-silver/10 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="glass-panel border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-platinum">{contact.name}</h3>
                    <span className="px-2 py-1 rounded-full bg-sapphire/20 text-sapphire text-xs">
                      {contact.contact_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-silver mb-1">
                    <Phone className="h-4 w-4" />
                    <span>{contact.phone_number}</span>
                  </div>
                  <p className="text-silver text-sm">
                    {contact.address && `${contact.address}, `}
                    {contact.city}
                    {contact.state && `, ${contact.state}`}
                  </p>
                </div>
                <Button
                  onClick={() => handleDelete(contact.id)}
                  variant="outline"
                  size="sm"
                  className="border-crimson/20 text-crimson hover:bg-crimson/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {contacts.length === 0 && !isAdding && (
          <Card className="glass-panel border-0">
            <CardContent className="p-8 text-center">
              <p className="text-silver mb-4">No emergency contacts added yet</p>
              <Button
                onClick={() => setIsAdding(true)}
                className="gradient-emerald hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsManager;