import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, MapPin, Calendar } from 'lucide-react';

const IncidentReporter = () => {
  const [formData, setFormData] = useState({
    incident_type: '',
    location_name: '',
    description: '',
    severity: 5,
    incident_date: '',
    lat: null as number | null,
    lng: null as number | null
  });
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          setFormData(prev => ({
            ...prev,
            lat: coords.lat,
            lng: coords.lng
          }));
          toast({
            title: "Location Captured",
            description: "Current location has been added to your report"
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not access location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.incident_type || !formData.location_name || !formData.incident_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('safety_incidents')
        .insert({
          ...formData,
          reported_by: user?.id,
          verified: false,
          public_data: true
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your incident report has been submitted for verification. Thank you for helping keep others safe."
      });

      // Reset form
      setFormData({
        incident_type: '',
        location_name: '',
        description: '',
        severity: 5,
        incident_date: '',
        lat: null,
        lng: null
      });
      setLocation(null);
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

  return (
    <Card className="glass-panel border-0">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-platinum flex items-center gap-2 text-lg sm:text-xl">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          Report Safety Incident
        </CardTitle>
        <CardDescription className="text-silver text-sm sm:text-base">
          Help keep the community safe by reporting incidents. All reports are reviewed before publication.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-platinum text-sm sm:text-base">Incident Type *</Label>
              <Select 
                value={formData.incident_type} 
                onValueChange={(value) => setFormData({ ...formData, incident_type: value })}
              >
                <SelectTrigger className="glass-input border-silver/20 text-platinum h-10 sm:h-11">
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="stalking">Stalking</SelectItem>
                  <SelectItem value="inappropriate_behavior">Inappropriate Behavior</SelectItem>
                  <SelectItem value="poor_lighting">Poor Lighting</SelectItem>
                  <SelectItem value="unsafe_area">Unsafe Area</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incident_date" className="text-platinum text-sm sm:text-base">Date & Time *</Label>
              <Input
                id="incident_date"
                type="datetime-local"
                value={formData.incident_date}
                onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                className="glass-input border-silver/20 text-platinum h-10 sm:h-11 text-sm sm:text-base"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="text-platinum flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base">
              <span>Location Name *</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="border-silver/20 text-silver hover:bg-silver/10 w-fit"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Use Current
              </Button>
            </Label>
            <Input
              id="location"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              className="glass-input border-silver/20 text-platinum h-10 sm:h-11 text-sm sm:text-base"
              placeholder="Street name, area, landmark..."
              required
            />
            {location && (
              <p className="text-xs text-silver">
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-platinum text-sm sm:text-base">Severity Level: {formData.severity}/10</Label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
              className="w-full h-2 bg-silver/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-silver">
              <span>Minor</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-platinum text-sm sm:text-base">Description (Optional)</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full glass-input border-silver/20 text-platinum min-h-[80px] sm:min-h-[100px] p-3 text-sm sm:text-base resize-none"
              placeholder="Provide additional details about the incident..."
            />
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-amber-200 text-xs sm:text-sm">
              <strong>Important:</strong> If this is an emergency, please call 100 (Police) or 1091 (Women Helpline) immediately. 
              This form is for reporting past incidents to help others stay safe.
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !user}
            className="w-full gradient-crimson hover:scale-105 transition-transform h-11 sm:h-12 text-sm sm:text-base"
          >
            {loading ? 'Submitting Report...' : 'Submit Report'}
          </Button>
          
          {!user && (
            <p className="text-center text-silver text-xs sm:text-sm">
              Please sign in to submit incident reports
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentReporter;