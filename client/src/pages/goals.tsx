import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUpRight, CalendarIcon, PlusCircle, Target, CheckCircle2, ListChecks } from 'lucide-react';
import NewGoalForm from '@/components/goals/NewGoalForm';

interface CarbonReductionGoal {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  categoryId: number | null;
  status: string;
  reminderFrequency: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function GoalsPage() {
  const { toast } = useToast();
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);

  // Fetch all goals
  const { data: goals, isLoading } = useQuery({
    queryKey: ['/api/carbon-reduction-goals'],
    select: (data: CarbonReductionGoal[]) => ({
      active: data.filter(goal => goal.status === 'active'),
      completed: data.filter(goal => goal.status === 'completed'),
      all: data
    })
  });

  // Mutation to update goal progress
  const updateGoalProgress = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: number; amount: number }) => {
      const response = await fetch(`/api/carbon-reduction-goals/${goalId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentAmount: amount }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update goal progress');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carbon-reduction-goals'] });
      toast({
        title: 'Progress updated',
        description: 'Your carbon reduction goal progress has been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Calculate days left for a goal
  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Carbon Reduction Goals</h1>
        <p>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Carbon Reduction Goals</h1>
        <Button onClick={() => setIsNewGoalDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> 
          New Goal
        </Button>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Target className="h-4 w-4" /> 
              Active Goals
              {goals?.active.length ? <Badge variant="secondary">{goals.active.length}</Badge> : null}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> 
              Completed
              {goals?.completed.length ? <Badge variant="secondary">{goals.completed.length}</Badge> : null}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> 
              All Goals
              {goals?.all.length ? <Badge variant="secondary">{goals.all.length}</Badge> : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {goals?.active.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You don't have any active goals.</p>
                <Button onClick={() => setIsNewGoalDialogOpen(true)} variant="outline" className="mt-4">
                  Create your first goal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals?.active.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    formatDate={formatDate} 
                    calculateDaysLeft={calculateDaysLeft}
                    getStatusColor={getStatusColor}
                    updateProgress={(amount) => updateGoalProgress.mutate({ goalId: goal.id, amount })} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {goals?.completed.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You haven't completed any goals yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals?.completed.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    formatDate={formatDate} 
                    calculateDaysLeft={calculateDaysLeft}
                    getStatusColor={getStatusColor}
                    updateProgress={(amount) => updateGoalProgress.mutate({ goalId: goal.id, amount })} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            {goals?.all.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You don't have any goals yet.</p>
                <Button onClick={() => setIsNewGoalDialogOpen(true)} variant="outline" className="mt-4">
                  Create your first goal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals?.all.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    formatDate={formatDate} 
                    calculateDaysLeft={calculateDaysLeft}
                    getStatusColor={getStatusColor}
                    updateProgress={(amount) => updateGoalProgress.mutate({ goalId: goal.id, amount })} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Carbon Reduction Goal</DialogTitle>
            <DialogDescription>
              Set a new goal to reduce your carbon footprint. Track your progress and make a difference.
            </DialogDescription>
          </DialogHeader>
          <NewGoalForm onSuccess={() => {
            setIsNewGoalDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['/api/carbon-reduction-goals'] });
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Goal Card Component
function GoalCard({ 
  goal, 
  formatDate, 
  calculateDaysLeft,
  getStatusColor,
  updateProgress 
}: { 
  goal: CarbonReductionGoal; 
  formatDate: (date: string) => string;
  calculateDaysLeft: (date: string) => number;
  getStatusColor: (status: string) => string;
  updateProgress: (amount: number) => void;
}) {
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);
  const [progressAmount, setProgressAmount] = useState(goal.currentAmount);
  const percentComplete = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const daysLeft = goal.status === 'active' ? calculateDaysLeft(goal.endDate) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{goal.title}</CardTitle>
          <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
        </div>
        <CardDescription>{goal.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{percentComplete}%</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{goal.currentAmount} kg CO₂e</span>
            <span>{goal.targetAmount} kg CO₂e</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
          </span>
        </div>
        
        {goal.status === 'active' && (
          <div className="text-sm">
            <span className="font-medium">{daysLeft}</span> days remaining
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-0">
        {goal.status === 'active' ? (
          <>
            {!showUpdateProgress ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowUpdateProgress(true)}
              >
                Update Progress
              </Button>
            ) : (
              <div className="space-y-2 w-full">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={goal.targetAmount * 2}
                    value={progressAmount}
                    onChange={(e) => setProgressAmount(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  />
                  <Button 
                    onClick={() => {
                      updateProgress(progressAmount);
                      setShowUpdateProgress(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setProgressAmount(goal.currentAmount);
                    setShowUpdateProgress(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Goal {goal.status}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}