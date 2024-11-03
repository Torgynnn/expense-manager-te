import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  CircleDollarSign, 
  ClipboardList,
  ArrowUpDown,
  UserPlus,
  FileSpreadsheet,
  Edit2,
  Save,
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Expense } from '@/lib/types';

interface DepartmentBudget {
  id: string;
  name: string;
  budget: number;
  spent: number;
  categories: string[];
}

// ... (keep other interfaces the same)

export const EnterpriseManager: React.FC<EnterpriseManagerProps> = ({ 
  expenses, 
  isEnterprise 
}) => {
  const [departments, setDepartments] = useState<DepartmentBudget[]>([
    { 
      id: '1',
      name: 'Marketing', 
      budget: 1000000, 
      spent: 0,
      categories: ['Advertising', 'Events', 'Content Creation']
    },
    { 
      id: '2',
      name: 'Sales', 
      budget: 800000, 
      spent: 0,
      categories: ['Travel', 'Client Meetings', 'Sales Tools']
    },
    { 
      id: '3',
      name: 'Development', 
      budget: 1200000, 
      spent: 0,
      categories: ['Software', 'Hardware', 'Training']
    },
    { 
      id: '4',
      name: 'Operations', 
      budget: 500000, 
      spent: 0,
      categories: ['Office Supplies', 'Utilities', 'Maintenance']
    }
  ]);

  // Dialog states
  const [showNewDeptDialog, setShowNewDeptDialog] = useState(false);
  const [showEditDeptDialog, setShowEditDeptDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentBudget | null>(null);

  // Form states
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    budget: '',
    categories: ''
  });

  const [editDepartment, setEditDepartment] = useState({
    id: '',
    name: '',
    budget: '',
    categories: ''
  });

  const handleAddDepartment = () => {
    if (newDepartment.name && newDepartment.budget) {
      setDepartments([...departments, {
        id: Math.random().toString(36).substr(2, 9),
        name: newDepartment.name,
        budget: parseFloat(newDepartment.budget),
        spent: 0,
        categories: newDepartment.categories.split(',').map(cat => cat.trim())
      }]);
      setNewDepartment({ name: '', budget: '', categories: '' });
      setShowNewDeptDialog(false);
    }
  };

  const handleEditClick = (dept: DepartmentBudget) => {
    setSelectedDepartment(dept);
    setEditDepartment({
      id: dept.id,
      name: dept.name,
      budget: dept.budget.toString(),
      categories: dept.categories.join(', ')
    });
    setShowEditDeptDialog(true);
  };

  const handleEditSave = () => {
    setDepartments(departments.map(dept => 
      dept.id === editDepartment.id
        ? {
            ...dept,
            name: editDepartment.name,
            budget: parseFloat(editDepartment.budget),
            categories: editDepartment.categories.split(',').map(cat => cat.trim())
          }
        : dept
    ));
    setShowEditDeptDialog(false);
  };

  const handleDeleteClick = (dept: DepartmentBudget) => {
    setSelectedDepartment(dept);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
      setShowDeleteDialog(false);
      setSelectedDepartment(null);
    }
  };

  const [monthlyData, setMonthlyData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedView, setSelectedView] = useState('overview');

  // ... (keep other existing functions)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Enterprise Expense Management
              <Badge variant="default" className="ml-2">Enterprise</Badge>
            </CardTitle>
            <Button onClick={() => setShowNewDeptDialog(true)}>
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Department Cards */}
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{dept.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        ₸{dept.budget.toLocaleString()}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditClick(dept)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(dept)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${Math.min((dept.spent / dept.budget) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Categories: {dept.categories.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ... (keep rest of the content) */}
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={showNewDeptDialog} onOpenChange={setShowNewDeptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                placeholder="Department name"
              />
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                type="number"
                value={newDepartment.budget}
                onChange={(e) => setNewDepartment({ ...newDepartment, budget: e.target.value })}
                placeholder="Budget amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Categories (comma-separated)</Label>
              <Input
                value={newDepartment.categories}
                onChange={(e) => setNewDepartment({ ...newDepartment, categories: e.target.value })}
                placeholder="e.g., Travel, Equipment, Marketing"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddDepartment}>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={showEditDeptDialog} onOpenChange={setShowEditDeptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input
                value={editDepartment.name}
                onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                placeholder="Department name"
              />
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                type="number"
                value={editDepartment.budget}
                onChange={(e) => setEditDepartment({ ...editDepartment, budget: e.target.value })}
                placeholder="Budget amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Categories (comma-separated)</Label>
              <Input
                value={editDepartment.categories}
                onChange={(e) => setEditDepartment({ ...editDepartment, categories: e.target.value })}
                placeholder="e.g., Travel, Equipment, Marketing"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDepartment?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};