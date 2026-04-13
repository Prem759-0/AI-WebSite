const [isUploading, setIsUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsUploading(true);
  const reader = new FileReader();
  
  reader.onload = async (event) => {
    const text = event.target?.result as string;
    // We send the file content as a hidden system-like message
    setInput(`Please summarize this file content: ${text.substring(0, 2000)}...`);
    setIsUploading(false);
  };
  
  reader.readAsText(file);
};
