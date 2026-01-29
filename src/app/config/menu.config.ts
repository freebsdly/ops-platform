// src/app/config/menu.config.ts
// 外部化的菜单配置文件，集中管理模块和菜单数据

export interface MenuItem {
  key: string;       // 国际化键值，用于翻译
  text: string;      // 显示文本（供参考和默认值）
  icon: string;      // 图标（必须）
  link?: string;     // 路由链接
  children?: MenuItem[]; // 子菜单
  open?: boolean;    // 是否默认展开
}

export interface ModuleConfig {
  id: string;
  title: string;
  icon: string;
  color: string;
  defaultPath: string;  // 模块的默认路由路径，用于智能识别
}

// 模块配置 - 定义所有可用的模块
export const MODULES_CONFIG: ModuleConfig[] = [
  {
    id: 'configuration',
    title: 'CONFIG.CONFIG_CENTER',
    icon: 'setting',
    color: '#1890ff',
    defaultPath: '/configuration/management/model',
  },
  {
    id: 'monitoring',
    title: 'CONFIG.MONITOR_CENTER',
    icon: 'monitor',
    color: '#52c41a',
    defaultPath: '/monitoring/management/object',
  },
  {
    id: 'incident',
    title: 'CONFIG.INCIDENT_CENTER',
    icon: 'alert',
    color: '#faad14',
    defaultPath: '/incident/management/aggregation',
  },
  {
    id: 'service',
    title: 'CONFIG.SERVICE_CENTER',
    icon: 'customer-service',
    color: '#722ed1',
    defaultPath: '/service/management/desk',
  },
];

// 菜单配置 - 按模块ID组织
// 使用国际化键值（key）和统一图标配置
export const MENUS_CONFIG: Record<string, MenuItem[]> = {
  configuration: [
    {
      key: 'CONFIG.CONFIG_MANAGEMENT',
      text: '配置管理',
      icon: 'database',
      open: true,
      children: [
        { key: 'CONFIG.MODEL_MANAGEMENT', text: '模型管理', icon: 'golden', link: '/configuration/management/model' },
        { key: 'CONFIG.ATTRIBUTE_MANAGEMENT', text: '属性管理', icon: 'appstore', link: '/configuration/management/attribute' },
        { key: 'CONFIG.RELATIONSHIP', text: '关联关系', icon: 'deployment-unit', link: '/configuration/management/relationship' },
      ],
    },
    {
      key: 'CONFIG.OPERATION_MANAGEMENT',
      text: '运营管理',
      icon: 'cluster',
      open: true,
      children: [
        { key: 'CONFIG.CONFIG_COLLECTION', text: '配置采集', icon: 'cloud-download', link: '/configuration/operation/collection' },
        { key: 'CONFIG.CONFIG_AUDIT', text: '配置审计', icon: 'audit', link: '/configuration/operation/audit' },
        { key: 'CONFIG.CONFIG_CHANGE', text: '配置变更', icon: 'sync', link: '/configuration/operation/config-change' },
      ],
    },
    {
      key: 'CONFIG.COLLABORATION',
      text: '协同赋能',
      icon: 'team',
      open: true,
      children: [
        { key: 'CONFIG.TOPOLOGY_VISUALIZATION', text: '拓扑可视化', icon: 'global', link: '/configuration/collaboration/topology' },
        { key: 'CONFIG.API_MANAGEMENT', text: 'API管理', icon: 'api', link: '/configuration/collaboration/api' },
        { key: 'CONFIG.COMPLIANCE_CHECK', text: '合规检查', icon: 'safety-certificate', link: '/configuration/collaboration/compliance' },
        { key: 'CONFIG.DATA_ANALYSIS', text: '数据分析', icon: 'bar-chart', link: '/configuration/collaboration/analysis' },
      ],
    },
  ],
  monitoring: [
    {
      key: 'CONFIG.BASIC_MANAGEMENT',
      text: '基础管理',
      icon: 'database',
      open: true,
      children: [
        { key: 'CONFIG.MONITOR_OBJECT', text: '监控对象', icon: 'desktop', link: '/monitoring/management/object' },
        { key: 'CONFIG.MULTI_DIMENSION_COLLECTION', text: '多维度采集', icon: 'radar-chart', link: '/monitoring/management/collection' },
        { key: 'CONFIG.COLLECTOR_MANAGEMENT', text: '采集器管理', icon: 'cloud-server', link: '/monitoring/management/collector' },
        { key: 'CONFIG.METRIC_STORAGE', text: '指标存储', icon: 'hdd', link: '/monitoring/management/storage' },
        { key: 'CONFIG.LOG_COLLECTION', text: '日志采集', icon: 'file-text', link: '/monitoring/management/log' },
        { key: 'CONFIG.LINK_MONITORING', text: '链路监控', icon: 'link', link: '/monitoring/management/link' },
        { key: 'CONFIG.CLOUD_NATIVE_MONITORING', text: '云原生监控', icon: 'cloud', link: '/monitoring/management/cloud' },
      ],
    },
    {
      key: 'CONFIG.OPERATION_MANAGEMENT',
      text: '运营管理',
      icon: 'cluster',
      open: true,
      children: [
        { key: 'CONFIG.VISUALIZATION', text: '可视化', icon: 'dashboard', link: '/monitoring/operation/visualization' },
        { key: 'CONFIG.ALERT_RULES', text: '告警规则', icon: 'warning', link: '/monitoring/operation/rules' },
        { key: 'CONFIG.ALERT_CONVERGENCE', text: '告警收敛', icon: 'filter', link: '/monitoring/operation/convergence' },
        { key: 'CONFIG.ALERT_DISTRIBUTION', text: '告警分发', icon: 'share-alt', link: '/monitoring/operation/distribution' },
        { key: 'CONFIG.ALERT_GRADING', text: '告警分级', icon: 'sort-ascending', link: '/monitoring/operation/alert-grading' },
        { key: 'CONFIG.ALERT_MASKING', text: '告警屏蔽', icon: 'eye-invisible', link: '/monitoring/operation/masking' },
        { key: 'CONFIG.LOG_SEARCH_ANALYSIS', text: '日志检索分析', icon: 'search', link: '/monitoring/operation/log-search' },
        { key: 'CONFIG.LINK_TRACING', text: '链路溯源', icon: 'fork', link: '/monitoring/operation/tracing' },
      ],
    },
    {
      key: 'CONFIG.COLLABORATION',
      text: '协同赋能',
      icon: 'team',
      open: true,
      children: [
        { key: 'CONFIG.METRIC_QUERY', text: '指标查询', icon: 'line-chart', link: '/monitoring/collaboration/query' },
        { key: 'CONFIG.MONITOR_ANALYSIS', text: '监控分析', icon: 'bar-chart', link: '/monitoring/collaboration/analysis' },
        { key: 'CONFIG.ANOMALY_DETECTION', text: '异常检测', icon: 'exclamation-circle', link: '/monitoring/collaboration/anomaly' },
        { key: 'CONFIG.CAPACITY_MONITORING', text: '容量监控', icon: 'database', link: '/monitoring/collaboration/capacity' },
        { key: 'CONFIG.AVAILABILITY_MONITORING', text: '可用度监控', icon: 'check-circle', link: '/monitoring/collaboration/availability' },
        { key: 'CONFIG.DATA_DASHBOARD', text: '数据大屏', icon: 'desktop', link: '/monitoring/collaboration/dashboard' },
      ],
    },
  ],
  incident: [
    {
      key: 'CONFIG.BASIC_MANAGEMENT',
      text: '基础管理',
      icon: 'database',
      open: true,
      children: [
        { key: 'CONFIG.EVENT_AGGREGATION', text: '事件聚合', icon: 'cluster', link: '/incident/management/aggregation' },
        { key: 'CONFIG.EVENT_GRADING', text: '事件定级', icon: 'sort-ascending', link: '/incident/management/event-grading' },
        { key: 'CONFIG.EVENT_LEDGER', text: '事件台账', icon: 'book', link: '/incident/management/ledger' },
        { key: 'CONFIG.ONCALL_SCHEDULING', text: 'OnCall排班', icon: 'team', link: '/incident/management/oncall' },
        { key: 'CONFIG.EVENT_CLASSIFICATION', text: '事件分类', icon: 'tags', link: '/incident/management/classification' },
        { key: 'CONFIG.SHIFT_HANDOVER', text: '值班交接', icon: 'swap', link: '/incident/management/handover' },
        { key: 'CONFIG.EVENT_SILENCE', text: '事件静默', icon: 'mute', link: '/incident/management/silence' },
      ],
    },
    {
      key: 'CONFIG.OPERATION_MANAGEMENT',
      text: '运营管理',
      icon: 'cluster',
      open: true,
      children: [
        { key: 'CONFIG.EVENT_RESPONSE', text: '事件响应', icon: 'rocket', link: '/incident/operation/response' },
        { key: 'CONFIG.EVENT_HANDLING', text: '事件处置', icon: 'tool', link: '/incident/operation/handling' },
        { key: 'CONFIG.EVENT_RECOVERY', text: '事件恢复', icon: 'undo', link: '/incident/operation/recovery' },
        { key: 'CONFIG.PROBLEM_MANAGEMENT', text: '问题管理', icon: 'question-circle', link: '/incident/operation/problem' },
        { key: 'CONFIG.ROOT_CAUSE_ANALYSIS', text: '根因分析', icon: 'experiment', link: '/incident/operation/rca' },
        { key: 'CONFIG.CHANGE_ASSOCIATION', text: '变更关联', icon: 'sync', link: '/incident/operation/change-association' },
        { key: 'CONFIG.EMERGENCY_PLAN', text: '应急预案', icon: 'safety', link: '/incident/operation/plan' },
        { key: 'CONFIG.CROSS_TEAM_COLLABORATION', text: '跨团队协作', icon: 'team', link: '/incident/operation/collaboration' },
      ],
    },
    {
      key: 'CONFIG.COLLABORATION',
      text: '协同赋能',
      icon: 'team',
      open: true,
      children: [
        { key: 'CONFIG.EVENT_REVIEW', text: '事件复盘', icon: 'history', link: '/incident/collaboration/review' },
        { key: 'CONFIG.EVENT_STATISTICS', text: '事件统计', icon: 'bar-chart', link: '/incident/collaboration/statistics' },
        { key: 'CONFIG.KNOWLEDGE_BASE', text: '经验库', icon: 'book', link: '/incident/collaboration/knowledge' },
        { key: 'CONFIG.STANDARDIZED_REVIEW', text: '标准化复盘', icon: 'safety-certificate', link: '/incident/collaboration/standard' },
        { key: 'CONFIG.FAULT_DRILL', text: '故障演练', icon: 'experiment', link: '/incident/collaboration/drill' },
        { key: 'CONFIG.DATA_ANALYSIS', text: '数据分析', icon: 'line-chart', link: '/incident/collaboration/analysis' },
        { key: 'CONFIG.INTELLIGENT_HANDLING', text: '智能处置', icon: 'robot', link: '/incident/collaboration/intelligent' },
      ],
    },
  ],
  service: [
    {
      key: 'CONFIG.BASIC_MANAGEMENT',
      text: '基础管理',
      icon: 'database',
      open: true,
      children: [
        { key: 'CONFIG.SERVICE_DESK', text: '服务台', icon: 'desktop', link: '/service/management/desk' },
        { key: 'CONFIG.WORK_ORDER_MANAGEMENT', text: '工单管理', icon: 'file-text', link: '/service/management/workorder' },
        { key: 'CONFIG.WORK_ORDER_APPROVAL', text: '工单审批', icon: 'check-circle', link: '/service/management/approval' },
        { key: 'CONFIG.SERVICE_CATALOG', text: '服务目录', icon: 'appstore', link: '/service/management/catalog' },
        { key: 'CONFIG.WORK_ORDER_DISPATCH', text: '工单派单', icon: 'share-alt', link: '/service/management/dispatch' },
        { key: 'CONFIG.WORK_ORDER_SLA', text: '工单SLA', icon: 'clock-circle', link: '/service/management/sla' },
        { key: 'CONFIG.ONLINE_CONSULTATION', text: '在线咨询', icon: 'message', link: '/service/management/consultation' },
      ],
    },
    {
      key: 'CONFIG.OPERATION_MANAGEMENT',
      text: '运营管理',
      icon: 'cluster',
      open: true,
      children: [
        { key: 'CONFIG.WORK_ORDER_EXECUTION', text: '工单执行', icon: 'rocket', link: '/service/operation/execution' },
        { key: 'CONFIG.WORK_ORDER_ARCHIVING', text: '工单归档', icon: 'folder', link: '/service/operation/archiving' },
        { key: 'CONFIG.KNOWLEDGE_BASE', text: '知识库', icon: 'book', link: '/service/operation/knowledge' },
        { key: 'CONFIG.CUSTOMER_FEEDBACK', text: '客户反馈', icon: 'like', link: '/service/operation/feedback' },
        { key: 'CONFIG.SLA_MONITORING', text: 'SLA监控', icon: 'dashboard', link: '/service/operation/sla-monitor' },
        { key: 'CONFIG.SERVICE_LEVEL_MANAGEMENT', text: '服务级别管理', icon: 'star', link: '/service/operation/slm' },
        { key: 'CONFIG.BULK_WORK_ORDER_PROCESSING', text: '批量工单处理', icon: 'database', link: '/service/operation/bulk' },
        { key: 'CONFIG.SELF_SERVICE', text: '自助服务', icon: 'user', link: '/service/operation/selfservice' },
      ],
    },
    {
      key: 'CONFIG.COLLABORATION',
      text: '协同赋能',
      icon: 'team',
      open: true,
      children: [
        { key: 'CONFIG.SERVICE_REPORT', text: '服务报告', icon: 'file-text', link: '/service/collaboration/report' },
        { key: 'CONFIG.WORK_ORDER_STATISTICS', text: '工单统计', icon: 'bar-chart', link: '/service/collaboration/statistics' },
        { key: 'CONFIG.SERVICE_REPORT', text: '服务报告', icon: 'file-text', link: '/service/collaboration/service-report' },
        { key: 'CONFIG.COST_ALLOCATION', text: '成本分摊', icon: 'dollar', link: '/service/collaboration/cost' },
        { key: 'CONFIG.DATA_ANALYSIS', text: '数据分析', icon: 'line-chart', link: '/service/collaboration/analysis' },
        { key: 'CONFIG.SERVICE_IMPROVEMENT', text: '服务改进', icon: 'up-circle', link: '/service/collaboration/improvement' },
      ],
    },
  ],
};
