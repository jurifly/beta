'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function NotificationsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Choose how you want to be notified about deadlines and important events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails for upcoming deadlines and compliance alerts.
            </p>
          </div>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get push notifications on your devices. (Coming soon)
            </p>
          </div>
          <Switch id="push-notifications" disabled />
        </div>
         <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="digest-emails">Weekly Digest</Label>
            <p className="text-sm text-muted-foreground">
              Receive a summary of your compliance status every week.
            </p>
          </div>
          <Switch id="digest-emails" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}
