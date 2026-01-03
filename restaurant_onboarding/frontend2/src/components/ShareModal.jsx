import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareModal({ item, open, onClose }) {
  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500',
      action: () => {
        const text = `${item.title}\n${item.description}\n${item.url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(item.url)}`, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-sky-500',
      action: () => {
        const text = `${item.title} - ${item.description}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(item.url)}`, '_blank');
      }
    },
    {
      name: 'Instagram',
      icon: '📷',
      color: 'bg-pink-500',
      action: () => {
        toast.info('Please share via Instagram app');
      }
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-600',
      action: () => {
        const subject = item.title;
        const body = `${item.description}\n\nCheck it out: ${item.url}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    },
    {
      name: 'Copy Link',
      icon: '🔗',
      color: 'bg-purple-500',
      action: () => {
        navigator.clipboard.writeText(item.url);
        toast.success('Link copied to clipboard!');
        onClose();
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            Share
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-3">
          <div className="glass rounded-xl p-3">
            <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-white/60 text-xs">{item.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="flex flex-col items-center gap-2 p-3 glass rounded-xl hover:scale-105 transition-transform"
              >
                <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-2xl`}>
                  {option.icon}
                </div>
                <span className="text-white/80 text-xs">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
