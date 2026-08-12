export const selectTheme = (theme, invalid) => {

  return {
    colors: {
      ...theme.colors,
      primary25: "#B1B5C8",
      primary50: "#8A90AC",
      primary: invalid ? "#dc2626" : '#00a3ff',
      neutral20: invalid ? "#dc2626" : theme.colors.neutral20,
      neutral30: invalid ? "#dc2626" : theme.colors.neutral30,
    },
    borderRadius: 6,
    spacing: {
      controlHeight: 42,
      menuGutter: 8,
      baseUnit: 4
    }
  }
};