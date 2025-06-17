import React from 'react';
import { Button } from "@/components/ui/button";

export function ButtonExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">shadcn/ui Button 示例</h2>
      
      <div className="flex flex-wrap gap-3">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => alert('按钮被点击了！')}>
          点击我
        </Button>
        <Button disabled>
          禁用状态
        </Button>
      </div>
    </div>
  );
} 