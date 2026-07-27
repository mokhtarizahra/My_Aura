import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('Utility: cn', () => {
  it(' it must properly merge the classes and resolve the conflicts', () => {
    // test that tailwind-merge works (e.g., text-red-500 overrides text-blue-500)
    // Arrange
    const class1 = 'text-red-500';
    const class2 = 'text-blue-500';
    const class3 = 'font-bold';

    // Act
    const result = cn(class1, class2, class3);

    // Assert
    // tailwind-merge مرتب‌سازی می‌کند و آخرین کلاس رنگ (text-blue-500) را نگه می‌دارد
    expect(result).toBe('text-blue-500 font-bold');
  });
});
