import React from 'react';
import { CanvasElement } from '../../types/canvasObjects';
import { ShapeObject } from '../objects/ShapeObject';
import { FreehandObject } from '../objects/FreehandObject';
import { TextObject } from '../objects/TextObject';
import { StickyNoteObject } from '../objects/StickyNoteObject';
import { ConnectorObject } from '../objects/ConnectorObject';
import { FrameObject } from '../objects/FrameObject';

interface CanvasObjectProps {
  element: CanvasElement;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
}

export const CanvasObject: React.FC<CanvasObjectProps> = ({
  element,
  isSelected,
  isHovered,
  isEditing,
}) => {
  switch (element.type) {
    case 'shape':
      return <ShapeObject element={element} isSelected={isSelected} isHovered={isHovered} />;
    case 'pen':
      return <FreehandObject element={element} isSelected={isSelected} isHovered={isHovered} />;
    case 'text':
      return (
        <TextObject
          element={element}
          isSelected={isSelected}
          isHovered={isHovered}
          isEditing={isEditing}
        />
      );
    case 'sticky':
      return (
        <StickyNoteObject
          element={element}
          isSelected={isSelected}
          isHovered={isHovered}
          isEditing={isEditing}
        />
      );
    case 'connector':
      return <ConnectorObject element={element} isSelected={isSelected} isHovered={isHovered} />;
    case 'frame':
      return (
        <FrameObject
          element={element}
          isSelected={isSelected}
          isHovered={isHovered}
          isEditing={isEditing}
        />
      );
    default:
      return null;
  }
};
