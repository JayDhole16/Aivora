import React, { useState } from 'react';
import {
  Globe,
  Layout,
  Sliders,
  ExternalLink,
  Eye,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layers,
  Palette,
  MessageCircle,
  Calendar,
  Save,
  Rocket,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  useWebsiteConfig,
  useUpdateWebsiteConfig,
  usePublishWebsite,
  useVerifyDomain,
} from '@/hooks/useServices';
import { StatusChip } from '@/components/common/StatusChip';
import { cn, VERTICAL_LABELS } from '@/lib/utils';
import type { WebsiteTemplate, WebsiteSection } from '@/types';
import { toast } from 'sonner';

export function WebsiteBuilder() {
  const serviceId = 'svc-web-1';
  const { data: config, isLoading } = useWebsiteConfig(serviceId);
  const updateMutation = useUpdateWebsiteConfig(serviceId);
  const publishMutation = usePublishWebsite(serviceId);
  const verifyDomainMutation = useVerifyDomain(serviceId);

  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate>('salon');
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('s1');
  const [bookingWidget, setBookingWidget] = useState(true);
  const [chatWidget, setChatWidget] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [subdomain, setSubdomain] = useState('glow-salon');
  const [customDomain, setCustomDomain] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'domain'>('editor');

  React.useEffect(() => {
    if (config) {
      setSelectedTemplate(config.template);
      setSections(config.sections || []);
      setBookingWidget(config.bookingWidgetEnabled);
      setChatWidget(config.chatWidgetEnabled);
      setPrimaryColor(config.primaryColor || '#6366f1');
      setSubdomain(config.subdomain);
      setCustomDomain(config.customDomain || '');
    }
  }, [config]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const handleUpdateSection = (field: keyof WebsiteSection, value: any) => {
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSectionId ? { ...s, [field]: value } : s))
    );
  };

  const handleToggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      template: selectedTemplate,
      sections,
      bookingWidgetEnabled: bookingWidget,
      chatWidgetEnabled: chatWidget,
      primaryColor,
      subdomain,
      customDomain,
    });
  };

  const handlePublish = () => {
    publishMutation.mutate();
  };

  const handleVerify = () => {
    if (!customDomain) {
      toast.error('Enter your custom domain first.');
      return;
    }
    verifyDomainMutation.mutate(customDomain);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-neutral-100">
      {/* Header Strip */}
      <div className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-neutral-900">Website Builder</h1>
              <StatusChip status="draft" />
            </div>
            <p className="text-[11px] text-neutral-400">
              preview--{subdomain}.aivora.site
            </p>
          </div>
        </div>

        {/* Tab switcher: Editor vs Domain */}
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeTab === 'editor' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            Visual editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeTab === 'domain' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            Domain settings
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`https://preview--${subdomain}.aivora.site`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              toast.success('Opening staging preview URL in a new tab!');
            }}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Eye size={14} /> Preview
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save size={14} /> Save
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
          >
            {publishMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
            Publish live
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio or Domain Tab */}
      {activeTab === 'editor' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL: Section list & Template picker */}
          <div className="w-72 bg-white border-r border-neutral-200 flex flex-col justify-between overflow-y-auto">
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as WebsiteTemplate)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg font-medium outline-none"
                >
                  <option value="salon">Salon & Spa</option>
                  <option value="clinic">Clinic & Healthcare</option>
                  <option value="restaurant">Restaurant & Cafe</option>
                  <option value="gym">Gym & Fitness</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="home_services">Home Services</option>
                  <option value="generic">Modern Business</option>
                  <option value="blank">Blank Canvas</option>
                </select>
              </div>

              {/* Sections list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Page sections</span>
                </div>

                <div className="space-y-1.5">
                  {sections.map((section) => {
                    const isSelected = selectedSectionId === section.id;
                    return (
                      <div
                        key={section.id}
                        onClick={() => setSelectedSectionId(section.id)}
                        className={cn(
                          'flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all',
                          isSelected
                            ? 'border-sky-600 bg-sky-50 text-sky-900 font-semibold shadow-2xs'
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Layers size={14} className={isSelected ? 'text-sky-600' : 'text-neutral-400'} />
                          <span className="capitalize">{section.type}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSection(section.id);
                          }}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Global Integrations */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Widgets</span>
                <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer p-2 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-indigo-600" />
                    <span>Booking widget</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bookingWidget}
                    onChange={(e) => setBookingWidget(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-neutral-700 cursor-pointer p-2 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={15} className="text-emerald-600" />
                    <span>WhatsApp chat widget</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatWidget}
                    onChange={(e) => setChatWidget(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* CENTER PANEL: Visual Canvas (Simulated Live Preview) */}
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden min-h-[600px] flex flex-col justify-between">
              {/* Site Mock Nav */}
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-900">Glow Salon & Spa</span>
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
                  <span>Services</span>
                  <span>About</span>
                  <span>Contact</span>
                  {bookingWidget && (
                    <span
                      style={{ backgroundColor: primaryColor }}
                      className="text-white px-3 py-1.5 rounded-lg font-semibold shadow-2xs"
                    >
                      Book now
                    </span>
                  )}
                </div>
              </div>

              {/* Sections rendering */}
              <div className="p-8 space-y-12">
                {sections
                  .filter((s) => s.enabled)
                  .map((sec) => (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={cn(
                        'p-6 rounded-2xl border-2 transition-all cursor-pointer relative',
                        selectedSectionId === sec.id
                          ? 'border-sky-500 bg-sky-50/20'
                          : 'border-dashed border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                        {sec.type}
                      </span>

                      {sec.type === 'hero' && (
                        <div className="text-center py-6 space-y-3">
                          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                            {sec.title || 'Where Beauty Meets Relaxation'}
                          </h2>
                          <p className="text-sm text-neutral-500 max-w-md mx-auto">
                            {sec.content || 'Book your personalized haircut, facial, and nail styling today.'}
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              style={{ backgroundColor: primaryColor }}
                              className="text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                            >
                              Schedule Appointment
                            </button>
                          </div>
                        </div>
                      )}

                      {sec.type === 'services' && (
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900 mb-4">{sec.title || 'Our Popular Services'}</h3>
                          <div className="grid grid-cols-3 gap-3">
                            {["Women's Haircut — $45", 'Classic Facial — $65', 'Gel Manicure — $35'].map((item, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl border border-neutral-200 bg-white text-xs">
                                <p className="font-semibold text-neutral-900">{item.split('—')[0]}</p>
                                <p className="text-neutral-500 mt-1">{item.split('—')[1]}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sec.type === 'about' && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-neutral-900">{sec.title || 'About Our Business'}</h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {sec.content || 'Dedicated to providing high-quality salon and spa services since 2018.'}
                          </p>
                        </div>
                      )}

                      {sec.type === 'booking' && (
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center space-y-2">
                          <h3 className="text-sm font-bold text-neutral-900">Instant AI Calendar Booking</h3>
                          <p className="text-xs text-neutral-500">
                            Clients pick a stylist and time slot in real-time.
                          </p>
                        </div>
                      )}

                      {sec.type === 'testimonials' && (
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900 mb-3">{sec.title || 'Client Reviews'}</h3>
                          <div className="grid grid-cols-2 gap-3 text-xs italic text-neutral-600">
                            <div className="p-3 bg-neutral-50 rounded-xl">"Best salon experience in town! — Sarah"</div>
                            <div className="p-3 bg-neutral-50 rounded-xl">"Super easy WhatsApp booking. — Michael"</div>
                          </div>
                        </div>
                      )}

                      {sec.type === 'contact' && (
                        <div className="text-xs text-neutral-600 space-y-1">
                          <h3 className="text-sm font-bold text-neutral-900">{sec.title || 'Find Us'}</h3>
                          <p>42 MG Road, Bengaluru</p>
                          <p>Open Monday–Saturday: 9am–7pm</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Site Mock Footer */}
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 text-center text-xs text-neutral-400">
                © {new Date().getFullYear()} Glow Salon & Spa. Powered by Aivora.
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Contextual Section Settings */}
          <div className="w-80 bg-white border-l border-neutral-200 p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Section settings</span>
              <span className="text-xs capitalize font-semibold text-sky-600">{selectedSection?.type}</span>
            </div>

            {selectedSection ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Section heading</label>
                  <input
                    type="text"
                    value={selectedSection.title || ''}
                    onChange={(e) => handleUpdateSection('title', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Body content</label>
                  <textarea
                    rows={4}
                    value={selectedSection.content || ''}
                    onChange={(e) => handleUpdateSection('content', e.target.value)}
                    className="w-full p-3 text-xs border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Brand accent color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer border-0"
                    />
                    <span className="font-mono text-xs text-neutral-600">{primaryColor}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">Select any section on the canvas to configure its content.</p>
            )}
          </div>
        </div>
      ) : (
        /* DOMAIN TAB */
        <div className="flex-1 max-w-3xl mx-auto p-8 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Domain & URL Configuration</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Launch on your free Aivora subdomain or connect your own registered custom domain.
            </p>
          </div>

          {/* Free Subdomain */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">Free Aivora subdomain</span>
              <span className="text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="w-48 px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono outline-none"
              />
              <span className="text-xs font-medium text-neutral-500">.aivora.site</span>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Connect your custom domain (e.g. glowsalon.com)</h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="www.yourdomain.com"
                className="flex-1 px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifyDomainMutation.isPending}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                {verifyDomainMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Verify DNS records
              </button>
            </div>

            {/* DNS Instructions */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-neutral-800">Add these DNS records at your registrar (GoDaddy, Namecheap, Cloudflare):</p>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-neutral-200">
                <span className="text-neutral-500">CNAME</span>
                <span className="text-neutral-900 font-semibold">www</span>
                <span className="text-indigo-600">cname.aivora.site</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
