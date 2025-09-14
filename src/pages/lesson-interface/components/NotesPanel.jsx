import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NotesPanel = ({ lesson, isVisible }) => {
  const [activeTab, setActiveTab] = useState('notes');
  const [userNotes, setUserNotes] = useState('');

  const tabs = [
    { id: 'notes', label: 'Notes', icon: 'FileText' },
    { id: 'formulas', label: 'Formulas', icon: 'Calculator' },
    { id: 'hints', label: 'Hints', icon: 'Lightbulb' }
  ];

  const formulas = [
    {
      name: "Ohm\'s Law",
      formula: "V = I × R",
      description: "Voltage equals Current times Resistance",
      variables: [
        { symbol: 'V', name: 'Voltage', unit: 'Volts (V)' },
        { symbol: 'I', name: 'Current', unit: 'Amperes (A)' },
        { symbol: 'R', name: 'Resistance', unit: 'Ohms (Ω)' }
      ]
    },
    {
      name: "Power Formula",
      formula: "P = V × I",
      description: "Power equals Voltage times Current",
      variables: [
        { symbol: 'P', name: 'Power', unit: 'Watts (W)' },
        { symbol: 'V', name: 'Voltage', unit: 'Volts (V)' },
        { symbol: 'I', name: 'Current', unit: 'Amperes (A)' }
      ]
    }
  ];

  const hints = [
    {
      id: 1,
      title: "Understanding Circuit Analysis",
      content: "Start by identifying all the components in the circuit. Look for resistors, voltage sources, and current paths."
    },
    {
      id: 2,
      title: "Common Mistakes",
      content: "Remember that current flows from positive to negative terminal. Don\'t confuse conventional current flow with electron flow."
    },
    {
      id: 3,
      title: "Problem-Solving Strategy",
      content: "Always write down what you know and what you need to find. Use the appropriate formula based on the given information."
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab?.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span className="hidden sm:inline">{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notes' && (
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-4">My Notes</h3>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Add a note title..."
                className="mb-2"
              />
              
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e?.target?.value)}
                placeholder="Write your notes here..."
                className="w-full h-32 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              
              <Button variant="default" size="sm" fullWidth>
                Save Note
              </Button>
            </div>

            {/* Saved Notes */}
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-3">Saved Notes</h4>
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-3">
                  <h5 className="font-medium text-foreground text-sm">Key Concepts</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ohm's law is fundamental for circuit analysis. Remember V=IR relationship.
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Icon name="Trash2" size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Key Formulas</h3>
            
            <div className="space-y-4">
              {formulas?.map((formula, index) => (
                <div key={index} className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">{formula?.name}</h4>
                  
                  <div className="bg-card border border-border rounded-lg p-3 mb-3">
                    <div className="text-center text-lg font-mono text-primary">
                      {formula?.formula}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{formula?.description}</p>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-foreground">Variables:</h5>
                    {formula?.variables?.map((variable, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-primary">{variable?.symbol}</span>
                        <span className="text-foreground">{variable?.name}</span>
                        <span className="text-muted-foreground">{variable?.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Helpful Hints</h3>
            
            <div className="space-y-4">
              {hints?.map((hint) => (
                <div key={hint?.id} className="bg-muted rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="Lightbulb" size={16} className="text-warning" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">{hint?.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {hint?.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="MessageCircle" size={16} className="text-primary" />
                <span className="font-medium text-primary">Need More Help?</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Join the discussion forum to ask questions and get help from peers.
              </p>
              <Button variant="outline" size="sm" fullWidth>
                Open Discussion
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;