'use client';

import { useState, useEffect } from 'react';

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
}

export default function PageSettingsPage() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: '',
    subtitle: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      if (response.ok) {
        const data = await response.json();
        setHeroSettings(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load page settings' });
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      setMessage({ type: 'error', text: 'Failed to load page settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveHeroSettings = async () => {
    if (!heroSettings.title.trim() || !heroSettings.subtitle.trim() || !heroSettings.description.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(heroSettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Page settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save page settings' });
      }
    } catch (error) {
      console.error('Error saving hero settings:', error);
      setMessage({ type: 'error', text: 'Failed to save page settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof HeroSettings, value: string) => {
    setHeroSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content">Loading page settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content">Page Settings</h1>
        <p className="text-base-content/70 mt-2">Manage your website's hero section content</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 border-b border-base-300">
          <h2 className="card-title text-xl">Hero Section</h2>
          <p className="text-base-content/70 mt-2">
            Customize the main content displayed on your homepage hero section
          </p>
        </div>
        <div className="card-body p-6 space-y-6">
          <div className="form-control">
            <label className="label" htmlFor="title">
              <span className="label-text">Title</span>
            </label>
            <input
              id="title"
              type="text"
              value={heroSettings.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
              placeholder="Enter hero title"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="subtitle">
              <span className="label-text">Subtitle</span>
            </label>
            <input
              id="subtitle"
              type="text"
              value={heroSettings.subtitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('subtitle', e.target.value)}
              placeholder="Enter hero subtitle"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="description">
              <span className="label-text">Description</span>
            </label>
            <textarea
              id="description"
              value={heroSettings.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              placeholder="Enter hero description"
              rows={4}
              className="textarea textarea-bordered w-full"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={saveHeroSettings}
              disabled={isSaving}
              className="btn btn-primary flex-1"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button 
              onClick={fetchHeroSettings}
              disabled={isSaving}
              className="btn btn-outline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-header p-6 border-b border-base-300">
          <h2 className="card-title text-xl">Preview</h2>
          <p className="text-base-content/70 mt-2">
            This is how your hero section will appear on the homepage
          </p>
        </div>
        <div className="card-body p-6">
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-content p-8 rounded-lg">
            <h1 className="text-4xl font-bold mb-4">
              {heroSettings.title || 'Your Title Here'}
            </h1>
            <h2 className="text-xl font-semibold mb-4">
              {heroSettings.subtitle || 'Your Subtitle Here'}
            </h2>
            <p className="text-lg opacity-90">
              {heroSettings.description || 'Your description will appear here...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
