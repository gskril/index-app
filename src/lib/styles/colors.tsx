import tailwindConfig from './tailwind.config'

export const colors = {
  ic: tailwindConfig.theme.extend.colors.ic,
  icGray1: '#EBF2F2',
  icGray2: '#A6B2B2',
  icGray3: '#627171',
  icGray4: '#2C3333',
  icWhite: '#FCFFFF',
  // not verified with designer (will be replaced soon)
  icGrayLightMode: '#aaa',
  icGrayDarkMode: '#777',
}

export const colorStyles = (isDarkMode: boolean) => {
  return {
    background: isDarkMode ? colors.ic.black : colors.ic.white,
    backgroundGradient: isDarkMode
      ? 'linear(to-tr, #143438, #0F1717, #0F1717)'
      : 'linear(to-tr, #F7F8F8, #FCFFFF, #FCFFFF)',
    backgroundInverted: isDarkMode ? colors.ic.white : colors.ic.black,
    border: isDarkMode ? colors.icGray4 : colors.ic.gray[100],
    text: isDarkMode ? colors.ic.white : colors.ic.black,
    text2: isDarkMode ? colors.icGray2 : colors.icGray4,
    text3: colors.icGray3,
    textInverted: isDarkMode ? colors.ic.black : colors.ic.white,
  }
}

export const useColorStyles = () => {
  const { isDarkMode } = useICColorMode()
  return {
    isDarkMode,
    styles: colorStyles(isDarkMode),
  }
}

export const useICColorMode = () => {
  // const { colorMode } = useColorMode()
  const isDarkMode = false
  return { isDarkMode }
}
