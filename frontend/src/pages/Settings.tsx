import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, exportData, exportTransactionsCsv, importData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportJson = () => {
    setIsExportingJson(true);
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `money-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Data exported',
        description: 'Your data has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const csv = exportTransactionsCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `money-tracker-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Transactions exported',
        description: 'Your transactions have been downloaded as an Excel-compatible CSV file.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export transactions',
        variant: 'destructive',
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        importData(data);
        toast({
          title: 'Data imported',
          description: 'Your data has been restored',
        });
        navigate('/dashboard');
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Invalid data format',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account and data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Currency</p>
            <p className="font-medium">{user?.currency}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Backup and restore your financial data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExportExcel} disabled={isExportingExcel} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export to Excel (CSV)
              </Button>
              <Button variant="outline" onClick={handleExportJson} disabled={isExportingJson} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export JSON Backup
              </Button>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()} className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>
          <div className="bg-muted p-4 rounded-md text-sm">
            <p className="font-medium mb-2">About Backups</p>
            <p className="text-muted-foreground">
              Export your data to create a backup. You can import this file later to restore all your transactions, accounts, and budgets.
              Your data is stored locally in your browser and will be lost if you clear browser data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
