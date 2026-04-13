// Inside executeChat function, look for the 'image' mode block:
if (mode === "image") {
  const res = await fetch("/api/image", { 
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userMsg.content }) 
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    // If the API returns an error, show it in the chat instead of crashing
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: `❌ Error: ${data.error || "Failed to generate image. Ensure your API key has credits."}` 
    }]);
  } else {
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: `![Generated Image](${data.url})` 
    }]);
  }
}
