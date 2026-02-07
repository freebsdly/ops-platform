// 模拟localStorage中的tabs数据
const testData = {
  tabs: [
    {
      key: 'CONFIG.OVERVIEW_DASHBOARD',
      label: 'CONFIG.OVERVIEW_DASHBOARD',
      path: '/workbench/dashboard/overview',
      icon: 'dashboard',
      closable: false,
    },
    {
      key: 'CONFIG.OVERVIEW_DASHBOARD',
      label: 'CONFIG.OVERVIEW_DASHBOARD', 
      path: '/workbench/dashboard/overview',
      icon: 'dashboard',
      closable: false,
    }
  ],
  selectedIndex: 0
};

console.log('测试数据:', JSON.stringify(testData, null, 2));

// 模拟loadTabsFromStorage逻辑
function loadTabsFromStorage() {
  try {
    const stored = JSON.stringify(testData);
    if (stored) {
      const parsed = JSON.parse(stored);
      const tabs = parsed.tabs || [];
      
      // Convert old 'dashboard' or 'workbench' tabs to new 'CONFIG.OVERVIEW_DASHBOARD' tab
      const convertedTabs = tabs.map((tab) => {
        if (tab.key === 'dashboard' || tab.key === 'workbench') {
          return {
            key: 'CONFIG.OVERVIEW_DASHBOARD',
            label: 'CONFIG.OVERVIEW_DASHBOARD',
            path: '/workbench/dashboard/overview',
            icon: 'dashboard',
            closable: false,
          };
        }
        return tab;
      });
      
      const hasOverviewDashboard = convertedTabs.some((tab) => tab.key === 'CONFIG.OVERVIEW_DASHBOARD');

      if (!hasOverviewDashboard) {
        return [
          {
            key: 'CONFIG.OVERVIEW_DASHBOARD',
            label: 'CONFIG.OVERVIEW_DASHBOARD',
            path: '/workbench/dashboard/overview',
            icon: 'dashboard',
            closable: false,
          },
          ...convertedTabs,
        ];
      }
      
      // Remove duplicate overview dashboard tabs
      const uniqueTabs = convertedTabs.filter((tab, index, self) =>
        index === self.findIndex((t) => t.key === tab.key)
      );
      
      console.log('处理后的tabs:', uniqueTabs.map(t => t.key));
      return uniqueTabs;
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Default tab if no storage or error
  return [
    {
      key: 'CONFIG.OVERVIEW_DASHBOARD',
      label: 'CONFIG.OVERVIEW_DASHBOARD',
      path: '/workbench/dashboard/overview',
      icon: 'dashboard',
      closable: false,
    },
  ];
}

loadTabsFromStorage();
