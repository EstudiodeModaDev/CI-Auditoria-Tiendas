import type { GroupBase, StylesConfig } from 'react-select'

type BaseSelectOption = {
  label: string
  value: string | number
  helper?: string
}

export function buildConfigSelectStyles<Option extends BaseSelectOption, IsMulti extends boolean = false>(): StylesConfig<Option, IsMulti, GroupBase<Option>> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: 54,
      borderRadius: 16,
      borderColor: state.isFocused ? 'rgba(14, 165, 233, 0.7)' : 'rgba(148, 163, 184, 0.3)',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(14, 165, 233, 0.14)' : 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingLeft: 4,
      paddingRight: 4,
      '&:hover': {
        borderColor: state.isFocused ? 'rgba(14, 165, 233, 0.7)' : 'rgba(148, 163, 184, 0.45)',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '4px 10px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#64748b',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#0f172a',
    }),
    input: (base) => ({
      ...base,
      color: '#0f172a',
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: 'rgba(148, 163, 184, 0.24)',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#0891b2' : '#64748b',
      '&:hover': {
        color: '#0891b2',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#64748b',
      '&:hover': {
        color: '#0f172a',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 30,
      border: '1px solid rgba(148, 163, 184, 0.18)',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 24px 56px rgba(15, 23, 42, 0.18)',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: 8,
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: 12,
      padding: '12px 14px',
      backgroundColor: state.isSelected
        ? 'rgba(8, 145, 178, 0.14)'
        : state.isFocused
          ? 'rgba(226, 232, 240, 0.8)'
          : '#ffffff',
      color: '#0f172a',
      cursor: 'pointer',
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: '#64748b',
    }),
  }
}

export function buildSelectLayerProps() {
  if (typeof document === 'undefined') {
    return {
      menuPosition: 'absolute' as const,
    }
  }

  return {
    menuPortalTarget: document.body,
    menuPosition: 'fixed' as const,
  }
}
