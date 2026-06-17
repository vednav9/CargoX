import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h3 class="text-lg font-semibold mb-4">📈 {{ title }}</h3>
      
      <!-- Simple Bar Chart Visualization -->
      <div class="space-y-3">
        @for (item of data; track item.label) {
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">{{ item.label }}</span>
            <div class="flex items-center space-x-2 flex-1 mx-4">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                     [style.width.%]="(item.value / maxValue) * 100"></div>
              </div>
              <span class="text-sm font-bold min-w-[60px] text-right">{{ item.value }}{{ suffix }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AnalyticsChart {
  @Input() title: string = '';
  @Input() data: { label: string; value: number }[] = [];
  @Input() suffix: string = '';
  
  get maxValue(): number {
    return Math.max(...this.data.map(d => d.value));
  }
}
