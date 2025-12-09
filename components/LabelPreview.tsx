import React from 'react';
import { LabelData, LabelTemplate } from '../types';

interface LabelPreviewProps {
  labels: LabelData[];
  template: LabelTemplate;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ labels, template }) => {
  // Show max 1 page of labels for preview performance
  const previewLabels = labels.slice(0, template.labelsPerPage);

  // CSS Grid style calculation
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
    gap: `${template.horizontalGap}in`,
    rowGap: `${template.verticalGap}in`,
    paddingTop: `${template.marginTop}in`,
    paddingLeft: `${template.marginLeft}in`,
    paddingRight: '0.1in', // approximate
    width: '8.5in',
    height: '11in',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    position: 'relative' as const,
    fontSize: `${template.fontSize}pt` // approximate scaling
  };

  return (
    <div className="overflow-auto bg-gray-100 p-8 rounded-xl border border-gray-300">
      <div className="origin-top scale-75 md:scale-100 transition-transform" style={{ width: '8.5in', margin: '0 auto' }}>
        <div style={gridStyle}>
          {previewLabels.map((label, idx) => (
            <div 
              key={label.id}
              className="flex flex-col items-center justify-center text-center font-bold border border-gray-100 bg-white"
              style={{
                width: `${template.labelWidth}in`,
                height: `${template.labelHeight}in`,
                fontSize: `${template.fontSize}pt`,
                lineHeight: 1.2
              }}
            >
              <div className="w-full overflow-hidden px-2">
                <div>{label.name}</div>
                <div>{label.address1}</div>
                {label.address2 && <div>{label.address2}</div>}
                <div>{label.city}, {label.state} {label.zip}</div>
              </div>
            </div>
          ))}
          {/* Fill empty spots to show layout structure */}
          {Array.from({ length: template.labelsPerPage - previewLabels.length }).map((_, idx) => (
            <div 
              key={`empty-${idx}`}
              className="border border-dashed border-gray-200 bg-gray-50"
              style={{
                width: `${template.labelWidth}in`,
                height: `${template.labelHeight}in`
              }}
            />
          ))}
        </div>
      </div>
      <div className="text-center mt-4 text-gray-500 text-sm">
        Previewing Page 1 of {Math.ceil(labels.length / template.labelsPerPage)}
      </div>
    </div>
  );
};