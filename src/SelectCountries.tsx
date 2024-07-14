import * as React from 'react';
import { MultiSelect } from '@blueprintjs/select';
import { MenuItem } from '@blueprintjs/core';

function toggleItems(selected: string[], item: string) {
  if (selected.includes(item)) {
    return selected.filter(v => v !== item);
  } else {
    return selected.concat(item);
  }
}

export default function (props: { items: string[], selected: string[], onSelect: (selected: string[]) => void }) {

  return (
    <MultiSelect<string>
      fill
      items={props.items}
      itemRenderer={(item, { modifiers, handleClick }) =>
        <MenuItem
          {...modifiers}
          onClick={handleClick}
          text={item}
          icon={props.selected.includes(item) ? 'tick' : false}
        />
      }
      tagRenderer={item => item}
      onItemSelect={(group) => props.onSelect(toggleItems(props.selected, group))}
      onRemove={group => props.onSelect(toggleItems(props.selected, group))}
      onClear={() => props.onSelect([])}
      selectedItems={props.selected}
      itemPredicate={(query, item) => item.includes(query)}
    />
  );
}