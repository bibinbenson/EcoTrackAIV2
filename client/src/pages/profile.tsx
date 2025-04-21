import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Award, 
  Clock, 
  Calendar,
  Share2,
  Download,
  Settings,
  ChevronRight,
  Edit,
  Image,
  Shield,
  Lock,
  Bell,
  Trash2,
  CheckCircle,
  LogOut,
  Save,
  X
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { SocialShare } from "@/components/SocialShare";
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Form schema for profile update
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  notifications: z.boolean().default(true),
  publicProfile: z.boolean().default(true),
  showAchievements: z.boolean().default(true),
  allowSocialSharing: z.boolean().default(false)
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { toast } = useToast();
  const { user: authUser, logoutMutation } = useAuth();
  
  // Fetch current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });
  
  // Fetch user achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/user-achievements"],
    queryFn: async () => {
      const res = await fetch("/api/user-achievements");
      if (!res.ok) throw new Error("Failed to fetch user achievements");
      return res.json();
    }
  });
  
  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/activities/recent", 10],
    queryFn: async () => {
      const res = await fetch("/api/activities/recent?limit=10");
      if (!res.ok) throw new Error("Failed to fetch recent activities");
      return res.json();
    }
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/users/me", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setIsEditProfileOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/users/password", data);
      return res.json();
    },
    onSuccess: () => {
      setIsChangePasswordOpen(false);
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    }
  });
  
  // Profile form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      bio: "",
      company: "",
      location: "",
      website: "",
      notifications: true,
      publicProfile: true,
      showAchievements: true,
      allowSocialSharing: false
    }
  });
  
  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        company: user.company || "",
        location: user.location || "",
        website: user.website || "",
        notifications: user.preferences?.notifications ?? true,
        publicProfile: user.preferences?.publicProfile ?? true,
        showAchievements: user.preferences?.showAchievements ?? true,
        allowSocialSharing: user.preferences?.allowSocialSharing ?? false
      });
    }
  }, [user, form]);
  
  // Form submit handler
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Get count of completed achievements
  const getCompletedAchievementsCount = () => {
    if (!achievements) return 0;
    return achievements.filter((a: any) => a.isCompleted).length;
  };
  
  // Get count of activities
  const getActivitiesCount = () => {
    if (!activities) return 0;
    return activities.length;
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and profile settings.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us a bit about yourself..." 
                        className="resize-none" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h4 className="font-medium text-sm pt-2">Privacy Settings</h4>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="publicProfile"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public Profile</FormLabel>
                        <FormDescription>
                          Allow others to view your profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="showAchievements"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Achievements</FormLabel>
                        <FormDescription>
                          Display your achievements on your public profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowSocialSharing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Social Sharing</FormLabel>
                        <FormDescription>
                          Allow automatic social media sharing
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin">●</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password for better security.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsChangePasswordOpen(false)}>
              <Lock className="mr-2 h-4 w-4" />
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-neutral-800 leading-7 sm:truncate">
            My Profile
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="outline" onClick={() => setActiveTab("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
          <SocialShare 
            title={`Check out my EcoTrack profile!`}
            text={`I've earned ${getCompletedAchievementsCount()} achievements and logged ${getActivitiesCount()} activities on my sustainability journey.`}
            triggerElement={
              <Button>
                <Share2 className="mr-2 h-4 w-4" />
                Share Profile
              </Button>
            }
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* User Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                {isLoadingUser ? (
                  <div className="h-24 w-24 rounded-full bg-neutral-200 animate-pulse"></div>
                ) : (
                  <img 
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=96&background=random`} 
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="h-24 w-24 rounded-full"
                  />
                )}
                
                <div className="mt-4 text-center">
                  {isLoadingUser ? (
                    <>
                      <div className="h-6 w-32 bg-neutral-200 rounded mx-auto mb-2 animate-pulse"></div>
                      <div className="h-4 w-24 bg-neutral-200 rounded mx-auto animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-neutral-800">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-neutral-600">@{user?.username}</p>
                    </>
                  )}
                </div>
                
                <div className="mt-6 border border-neutral-200 rounded-lg p-4 w-full">
                  <div className="flex justify-between">
                    <div className="text-center flex-1">
                      <p className="text-sm text-neutral-600">Carbon Score</p>
                      <p className="text-xl font-bold text-primary">{user?.score || "..."}</p>
                    </div>
                    <div className="text-center flex-1 border-l border-neutral-200">
                      <p className="text-sm text-neutral-600">Achievements</p>
                      <p className="text-xl font-bold text-amber-500">
                        {isLoadingAchievements ? "..." : getCompletedAchievementsCount()}
                      </p>
                    </div>
                    <div className="text-center flex-1 border-l border-neutral-200">
                      <p className="text-sm text-neutral-600">Activities</p>
                      <p className="text-xl font-bold text-blue-500">
                        {isLoadingActivities ? "..." : getActivitiesCount()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex flex-col gap-2">
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 mr-2"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Image className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export My Data
              </Button>
            </CardFooter>
          </Card>
          
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-neutral-800">
                My Stats
              </CardTitle>
              <CardDescription>
                Your environmental impact overview
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Highest Achievement</p>
                    <p className="font-medium text-neutral-800">Carbon Reducer</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Last Activity</p>
                    <p className="font-medium text-neutral-800">
                      {activities && activities[0] ? (
                        formatDate(activities[0].date)
                      ) : (
                        "No activities yet"
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Member Since</p>
                    <p className="font-medium text-neutral-800">June 2023</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-0">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Carbon Footprint Summary</h3>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-neutral-600">Current Month</p>
                        <p className="text-2xl font-bold text-primary">42 kg CO₂</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600">Previous Month</p>
                        <p className="text-2xl font-bold text-neutral-800">65 kg CO₂</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600">Monthly Trend</p>
                        <p className="text-2xl font-bold text-green-600">-35%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Recent Activity</h3>
                  
                  {isLoadingActivities ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 border border-neutral-200 rounded-lg animate-pulse">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                              <div className="ml-3">
                                <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                                <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                              </div>
                            </div>
                            <div className="h-6 w-16 bg-neutral-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !activities || activities.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <p>No activities logged yet. Use the calculator to log your first activity!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.slice(0, 3).map((activity: any) => (
                        <div key={activity.id} className="p-3 border border-neutral-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-neutral-800">{activity.description}</h4>
                              <p className="text-sm text-neutral-600">{formatDate(activity.date)}</p>
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {activity.carbonAmount.toFixed(2)} kg
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {activities.length > 3 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-primary"
                          onClick={() => setActiveTab("activities")}
                        >
                          View All Activities
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activities" className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">All Activities</h3>
                
                {isLoadingActivities ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-3 border border-neutral-200 rounded-lg animate-pulse">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                            <div className="ml-3">
                              <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                              <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                            </div>
                          </div>
                          <div className="h-6 w-16 bg-neutral-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !activities || activities.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <UserIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-800">No Activities Yet</h3>
                    <p className="mt-1 text-neutral-600">
                      Start tracking your carbon footprint by logging activities
                    </p>
                    <Button className="mt-4">Log First Activity</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="p-3 border border-neutral-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-neutral-800">{activity.description}</h4>
                            <p className="text-sm text-neutral-600">{formatDate(activity.date)}</p>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {activity.carbonAmount.toFixed(2)} kg
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="achievements" className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">All Achievements</h3>
                
                {isLoadingAchievements ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border border-neutral-200 rounded-lg animate-pulse">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-neutral-200 rounded-full"></div>
                          <div className="ml-3 flex-1">
                            <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                            <div className="h-3 w-full bg-neutral-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !achievements || achievements.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <Award className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-800">No Achievements Yet</h3>
                    <p className="mt-1 text-neutral-600">
                      Continue using the app to earn achievements
                    </p>
                    <Button className="mt-4">View Available Achievements</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="font-medium text-neutral-800">Completed</h4>
                      
                      {achievements.filter((a: any) => a.isCompleted).length === 0 ? (
                        <p className="text-sm text-neutral-600">No completed achievements yet</p>
                      ) : (
                        <div className="space-y-3">
                          {achievements
                            .filter((a: any) => a.isCompleted)
                            .map((achievement: any) => (
                              <div key={achievement.id} className="p-4 border border-neutral-200 rounded-lg">
                                <div className="flex items-center">
                                  <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                    <Award className="h-6 w-6" />
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="font-medium text-neutral-800">
                                      {achievement.name}
                                    </h4>
                                    <p className="text-sm text-neutral-600">
                                      {achievement.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="font-medium text-neutral-800">In Progress</h4>
                      
                      {achievements.filter((a: any) => !a.isCompleted).length === 0 ? (
                        <p className="text-sm text-neutral-600">No achievements in progress</p>
                      ) : (
                        <div className="space-y-3">
                          {achievements
                            .filter((a: any) => !a.isCompleted)
                            .map((achievement: any) => (
                              <div key={achievement.id} className="p-4 border border-neutral-200 rounded-lg">
                                <div className="flex items-center">
                                  <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Award className="h-6 w-6" />
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="font-medium text-neutral-800">
                                      {achievement.name}
                                    </h4>
                                    <p className="text-sm text-neutral-600">
                                      {achievement.description}
                                    </p>
                                    <div className="mt-2 bg-neutral-100 rounded-full h-2 overflow-hidden">
                                      <div 
                                        className="bg-blue-600 h-full rounded-full" 
                                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">
                                      {achievement.progress} / {achievement.target}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Account Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-md">Personal Information</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-600">Name</p>
                              <p className="font-medium text-neutral-800">{user?.firstName} {user?.lastName}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-600">Username</p>
                              <p className="font-medium text-neutral-800">@{user?.username}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-600">Email</p>
                              <p className="font-medium text-neutral-800">{user?.email}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsEditProfileOpen(true)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Lock className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-md">Security</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-600">Password</p>
                              <p className="font-medium text-neutral-800">••••••••</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-600">Last updated</p>
                              <p className="font-medium text-neutral-800">30 days ago</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-600">Two-factor</p>
                              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Disabled</Badge>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsChangePasswordOpen(true)}
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            Change Password
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Bell className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-md">Notifications</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">Email Notifications</p>
                                <p className="text-sm text-neutral-600">Receive updates via email</p>
                              </div>
                              <Switch defaultChecked id="email-notifications" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">Achievement Alerts</p>
                                <p className="text-sm text-neutral-600">Get notified when you earn achievements</p>
                              </div>
                              <Switch defaultChecked id="achievement-alerts" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">Weekly Reports</p>
                                <p className="text-sm text-neutral-600">Receive weekly carbon footprint summary</p>
                              </div>
                              <Switch defaultChecked id="weekly-reports" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">Marketing Communications</p>
                                <p className="text-sm text-neutral-600">Receive news and promotional offers</p>
                              </div>
                              <Switch id="marketing-comms" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-md">Privacy & Data</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">Public Profile</p>
                                <p className="text-sm text-neutral-600">Allow others to view your profile</p>
                              </div>
                              <Switch defaultChecked id="public-profile" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">Show Achievements</p>
                                <p className="text-sm text-neutral-600">Display achievements on public profile</p>
                              </div>
                              <Switch defaultChecked id="show-achievements" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">Data Collection</p>
                                <p className="text-sm text-neutral-600">Allow anonymous data collection for improvements</p>
                              </div>
                              <Switch defaultChecked id="data-collection" />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                          <Button variant="outline" className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download My Data
                          </Button>
                          <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <LogOut className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-md">Account Actions</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-neutral-600 mb-4">
                            When you log out, your session will be cleared from this device. You'll need to log in again to access your account.
                          </p>
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                          >
                            {logoutMutation.isPending ? (
                              <>
                                <span className="mr-2 h-4 w-4 animate-spin">●</span>
                                <span>Logging out...</span>
                              </>
                            ) : (
                              <>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}