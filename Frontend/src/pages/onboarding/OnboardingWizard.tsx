import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Zap,
  Globe,
  MessageCircle,
  Phone,
  Layers,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUploadKBDocument } from '@/hooks/useKnowledgeBase';
import { cn, VERTICAL_LABELS, DAYS_OF_WEEK, DAY_LABELS } from '@/lib/utils';
import type { IndustryVertical, KnowledgeBaseEntry } from '@/types';
import { toast } from 'sonner';

const onboardingSchema = z.object({
  businessName: z.string().min(2, 'Please enter your business name.'),
  vertical: z.enum(['salon', 'clinic', 'restaurant', 'gym', 'real_estate', 'home_services', 'other']),
  address: z.string().min(3, 'Please enter your address or city.'),
  timezone: z.string().min(1, 'Please select your timezone.'),
  primaryLanguage: z.string().min(1, 'Please select a language.'),
  firstService: z.enum(['website', 'whatsapp', 'voice', 'all']),
  services: z.array(
    z.object({
      name: z.string().min(1, 'Service name is required'),
      price: z.string().min(1, 'Price is required'),
      duration: z.string().min(1, 'Duration is required'),
    })
  ),
  faqs: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      answer: z.string().min(1, 'Answer is required'),
    })
  ),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const TIMEZONES = [
  'America/New_York (EST)',
  'America/Chicago (CST)',
  'America/Denver (MST)',
  'America/Los_Angeles (PST)',
  'Europe/London (GMT/BST)',
  'Asia/Kolkata (IST)',
  'Asia/Dubai (GST)',
  'Australia/Sydney (AEST)',
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Arabic', 'German', 'Portuguese'];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [parsedEntries, setParsedEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const uploadKBMutation = useUploadKBDocument();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: user?.org?.name || 'Glow Salon & Spa',
      vertical: (user?.org?.industryVertical as IndustryVertical) || 'salon',
      address: user?.org?.address || '42 MG Road, Bengaluru',
      timezone: 'Asia/Kolkata (IST)',
      primaryLanguage: 'English',
      firstService: 'whatsapp',
      services: [
        { name: "Women's Haircut", price: '$45', duration: '45 mins' },
        { name: 'Classic Facial', price: '$65', duration: '60 mins' },
      ],
      faqs: [
        {
          question: 'What are your cancellation policies?',
          answer: 'Please let us know at least 2 hours in advance to reschedule or cancel without any fee.',
        },
      ],
    },
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services',
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: 'faqs',
  });

  const selectedFirstService = watch('firstService');
  const selectedVertical = watch('vertical');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    try {
      const parsed = await uploadKBMutation.mutateAsync(file);
      setParsedEntries(parsed);
      toast.success('Document parsed! Review extracted items below.');
    } catch {
      toast.error('Failed to parse document. You can add items manually.');
    } finally {
      setIsParsingDoc(false);
    }
  };

  const handleComplete = (data: OnboardingFormData) => {
    sessionStorage.setItem('aivora_onboarded', 'true');
    toast.success('Business setup complete! Taking you to your builder.');

    // Route directly into the first chosen service builder
    if (data.firstService === 'voice') {
      navigate('/dashboard/voice');
    } else if (data.firstService === 'whatsapp') {
      navigate('/dashboard/whatsapp');
    } else if (data.firstService === 'website') {
      navigate('/dashboard/website');
    } else {
      // 'all' -> start with WhatsApp or Voice
      navigate('/dashboard/whatsapp');
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
      {/* Top Header & Progress */}
      <header className="bg-white border-b border-neutral-200 py-4 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm text-white">
            <Zap size={18} />
          </div>
          <div>
            <span className="font-bold text-neutral-900 text-base">Aivora</span>
            <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Setup wizard
            </span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span>Step {currentStep} of 3</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  step === currentStep ? 'w-8 bg-indigo-600' : step < currentStep ? 'w-4 bg-indigo-300' : 'w-4 bg-neutral-200'
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center">
        <form onSubmit={handleSubmit(handleComplete)}>
          {/* STEP 1: Business Basics */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Tell us about your business</h1>
                <p className="text-neutral-500 text-sm mt-1">
                  Your AI assistant will use this profile to sound authentic and answer customer questions.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business name</label>
                  <input
                    type="text"
                    {...register('businessName')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Glow Salon & Spa"
                  />
                  {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.entries(VERTICAL_LABELS).map(([key, label]) => {
                      const isSelected = selectedVertical === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setValue('vertical', key as IndustryVertical)}
                          className={cn(
                            'p-3 text-left rounded-xl border text-sm font-medium transition-all',
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                              : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Address or city</label>
                    <input
                      type="text"
                      {...register('address')}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="e.g. 42 MG Road, Bengaluru"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Primary language</label>
                    <select
                      {...register('primaryLanguage')}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Timezone</label>
                  <select
                    {...register('timezone')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: What to build first */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">What do you want to build first?</h1>
                <p className="text-neutral-500 text-sm mt-1">
                  You can set up all three anytime. Pick the channel that's most important for you right now.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'whatsapp',
                    title: 'WhatsApp assistant',
                    desc: 'Answers client chats, shares service prices, and takes bookings directly on WhatsApp.',
                    icon: MessageCircle,
                    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                    selectedBorder: 'border-emerald-600 ring-2 ring-emerald-600 bg-emerald-50/40',
                  },
                  {
                    id: 'voice',
                    title: 'AI voice receptionist',
                    desc: 'Picks up incoming phone calls 24/7, answers questions, and books appointments.',
                    icon: Phone,
                    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                    selectedBorder: 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50/40',
                  },
                  {
                    id: 'website',
                    title: 'Business website',
                    desc: 'A ready-to-launch website with built-in instant booking and customer chat widget.',
                    icon: Globe,
                    accent: 'text-sky-600 bg-sky-50 border-sky-200',
                    selectedBorder: 'border-sky-600 ring-2 ring-sky-600 bg-sky-50/40',
                  },
                  {
                    id: 'all',
                    title: 'All three channels',
                    desc: 'Spin up Voice, WhatsApp, and Website all sharing one unified profile and calendar.',
                    icon: Layers,
                    accent: 'text-purple-600 bg-purple-50 border-purple-200',
                    selectedBorder: 'border-purple-600 ring-2 ring-purple-600 bg-purple-50/40',
                  },
                ].map((item) => {
                  const isSelected = selectedFirstService === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setValue('firstService', item.id as any)}
                      className={cn(
                        'p-5 rounded-2xl border bg-white cursor-pointer transition-all duration-150 relative flex flex-col justify-between',
                        isSelected ? item.selectedBorder : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                      )}
                    >
                      <div>
                        <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center mb-3', item.accent)}>
                          <Icon size={22} />
                        </div>
                        <h3 className="font-semibold text-neutral-900 text-base">{item.title}</h3>
                        <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>

                      {isSelected && (
                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-neutral-900">
                          <CheckCircle2 size={15} className="text-indigo-600" /> Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Knowledge Base Seed */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Teach Aivora about your services</h1>
                <p className="text-neutral-500 text-sm mt-1">
                  Upload a menu/brochure PDF to auto-parse your services, or type your top offerings below.
                </p>
              </div>

              {/* Upload section */}
              <div className="bg-white rounded-2xl p-5 border border-dashed border-neutral-300 hover:border-indigo-400 transition-colors text-center">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isParsingDoc}
                  />
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                      {isParsingDoc ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    </div>
                    <span className="text-sm font-semibold text-neutral-900">
                      {isParsingDoc ? 'Auto-parsing price list...' : 'Upload price list, menu, or brochure (PDF/Image)'}
                    </span>
                    <span className="text-xs text-neutral-400 mt-1">
                      Our AI will automatically extract your services, pricing, and operating rules.
                    </span>
                  </div>
                </label>
              </div>

              {/* Auto-parsed entries banner */}
              {parsedEntries.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-2">
                    <Sparkles size={16} /> Extracted {parsedEntries.length} items from your document
                  </div>
                  <div className="space-y-1.5">
                    {parsedEntries.map((item) => (
                      <div key={item.id} className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs flex justify-between">
                        <span className="font-medium text-neutral-900">{item.title}</span>
                        <span className="text-neutral-500">{item.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Services Entry */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">Popular Services & Pricing</h3>
                  <button
                    type="button"
                    onClick={() => appendService({ name: '', price: '', duration: '30 mins' })}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus size={14} /> Add service
                  </button>
                </div>

                <div className="space-y-3">
                  {serviceFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <input
                        type="text"
                        {...register(`services.${index}.name` as const)}
                        placeholder="Service name (e.g. Deep Cleansing Facial)"
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        {...register(`services.${index}.price` as const)}
                        placeholder="Price (e.g. $50)"
                        className="w-24 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        {...register(`services.${index}.duration` as const)}
                        placeholder="Duration"
                        className="w-28 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      {serviceFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Common FAQs */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-900">Common customer questions (FAQs)</h3>
                    <button
                      type="button"
                      onClick={() => appendFaq({ question: '', answer: '' })}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <Plus size={14} /> Add question
                    </button>
                  </div>

                  <div className="space-y-3">
                    {faqFields.map((field, index) => (
                      <div key={field.id} className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-neutral-500">FAQ #{index + 1}</span>
                          {faqFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFaq(index)}
                              className="text-neutral-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          {...register(`faqs.${index}.question` as const)}
                          placeholder="Question (e.g. Do you take walk-ins?)"
                          className="w-full px-3 py-1.5 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <textarea
                          rows={2}
                          {...register(`faqs.${index}.answer` as const)}
                          placeholder="Answer (e.g. Yes, walk-ins are welcome based on availability, but appointments are recommended.)"
                          className="w-full px-3 py-1.5 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-neutral-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-all"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all"
              >
                Open builder <ArrowRight size={16} />
              </button>
            )}
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-neutral-400">
        Need help? Call our support team anytime. Aivora v1.0
      </footer>
    </div>
  );
}
