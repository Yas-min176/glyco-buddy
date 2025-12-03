import { useState } from 'react';
import { DosageRule } from '@/hooks/useDosageRules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Save, AlertTriangle, Activity } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DosageRuleEditorProps {
  rules: DosageRule[];
  onUpdate: (id: string, updates: Partial<DosageRule>) => void;
  onAdd: (rule: Omit<DosageRule, 'id' | 'user_id'>) => void;
  onDelete: (id: string) => void;
}

export function DosageRuleEditor({ rules, onUpdate, onAdd, onDelete }: DosageRuleEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    min_glucose: 250,
    max_glucose: 350,
    insulin_units: 2,
    recommendation: 'Tome 2 unidades de insulina.',
    is_emergency: false,
    display_order: 1,
  });
  const [showAddForm, setShowAddForm] = useState(rules.length === 0); // Abre automaticamente se não tem regras

  const handleSaveEdit = (rule: DosageRule) => {
    setEditingId(null);
  };

  const handleAddRule = () => {
    if (!newRule.recommendation.trim() || newRule.min_glucose < 0) {
      return;
    }
    onAdd(newRule);
    setNewRule({
      min_glucose: 250,
      max_glucose: 350,
      insulin_units: 2,
      recommendation: 'Tome 2 unidades de insulina.',
      is_emergency: false,
      display_order: rules.length + 2,
    });
    setShowAddForm(false);
  };

  const sortedRules = [...rules].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Regras de Dosagem
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure as doses de insulina baseadas nos níveis de glicemia
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Add New Rule Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-primary/20 bg-primary/5">
          <h3 className="text-lg font-bold mb-4">Nova Regra de Dosagem</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-min">Glicemia Mínima (mg/dL)</Label>
                <Input
                  id="new-min"
                  type="number"
                  value={newRule.min_glucose}
                  onChange={(e) => setNewRule({ ...newRule, min_glucose: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="new-max">Glicemia Máxima (mg/dL)</Label>
                <Input
                  id="new-max"
                  type="number"
                  value={newRule.max_glucose || ''}
                  onChange={(e) => setNewRule({ ...newRule, max_glucose: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Deixe vazio para sem limite"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-insulin">Unidades de Insulina (opcional)</Label>
              <Input
                id="new-insulin"
                type="number"
                value={newRule.insulin_units || ''}
                onChange={(e) => setNewRule({ ...newRule, insulin_units: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Ex: 2"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="new-recommendation">Recomendação</Label>
              <Textarea
                id="new-recommendation"
                value={newRule.recommendation}
                onChange={(e) => setNewRule({ ...newRule, recommendation: e.target.value })}
                placeholder="Ex: Tome 2 unidades de insulina humana regular."
                className="mt-2 min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="new-emergency"
                checked={newRule.is_emergency}
                onCheckedChange={(checked) => setNewRule({ ...newRule, is_emergency: checked })}
              />
              <Label htmlFor="new-emergency" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-danger" />
                Situação de emergência
              </Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddRule} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar Regra
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Rules */}
      <div className="space-y-3">
        {sortedRules.map((rule) => (
          <Card key={rule.id} className={`p-4 ${rule.is_emergency ? 'border-danger/50 bg-danger/5' : ''}`}>
            {editingId === rule.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Glicemia Mínima</Label>
                    <Input
                      type="number"
                      value={rule.min_glucose}
                      onChange={(e) => onUpdate(rule.id, { min_glucose: parseInt(e.target.value) || 0 })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Glicemia Máxima</Label>
                    <Input
                      type="number"
                      value={rule.max_glucose || ''}
                      onChange={(e) => onUpdate(rule.id, { max_glucose: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Sem limite"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Unidades de Insulina</Label>
                  <Input
                    type="number"
                    value={rule.insulin_units || ''}
                    onChange={(e) => onUpdate(rule.id, { insulin_units: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Recomendação</Label>
                  <Textarea
                    value={rule.recommendation}
                    onChange={(e) => onUpdate(rule.id, { recommendation: e.target.value })}
                    className="mt-2 min-h-[80px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rule.is_emergency}
                    onCheckedChange={(checked) => onUpdate(rule.id, { is_emergency: checked })}
                  />
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    Emergência
                  </Label>
                </div>

                <Button onClick={() => handleSaveEdit(rule)} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-primary">
                      {rule.min_glucose} - {rule.max_glucose || '∞'} mg/dL
                    </span>
                    {rule.is_emergency && (
                      <span className="text-xs bg-danger text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Emergência
                      </span>
                    )}
                    {rule.insulin_units && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                        {rule.insulin_units} unidades
                      </span>
                    )}
                  </div>
                  <p className="text-foreground">{rule.recommendation}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(rule.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(rule.id)}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra de dosagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A regra será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) onDelete(deleteConfirm);
                setDeleteConfirm(null);
              }}
              className="bg-danger hover:bg-danger/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
