import type { CourseModule } from "@/lib/course";
import type { LessonDetail } from "@/lib/lessonContent";

export type VisualPerceptionModule = Omit<CourseModule, "phase"> & {
  phase: "导览" | "成像" | "几何" | "估计" | "系统" | "实战";
};

export const visualPerceptionModules: VisualPerceptionModule[] = [
  { index: 0, slug: "map-and-problem", phase: "导览", title: "先画清 6D 问题地图", subtitle: "定位对象、坐标系、数据关联与整条视觉链", hours: "2h", level: "重点", tags: ["Pipeline", "数据关联", "坐标系"], outcome: "能把一次抓取失败定位到检测、几何、配准或坐标变换中的一层。" },
  { index: 1, slug: "imaging-and-depth", phase: "成像", title: "成像与深度相机", subtitle: "针孔模型、双目视差、RGB-D 对齐与深度噪声", hours: "4h", level: "手推", tags: ["Intrinsics", "Stereo", "RealSense"], outcome: "能从像素与深度恢复相机坐标，并解释误差随距离增大的原因。" },
  { index: 2, slug: "calibration", phase: "几何", title: "标定与手眼关系", subtitle: "内外参、eye-in-hand / eye-to-hand 与 AX=XB", hours: "5h", level: "手推", tags: ["Calibration", "AX=XB", "Frames"], outcome: "能设计姿态采集方案，求得并验证相机到机器人之间的固定变换。" },
  { index: 3, slug: "depth-to-pointcloud", phase: "几何", title: "深度图到点云", subtitle: "反投影、法线、降采样、平面分割与聚类", hours: "4h", level: "手推", tags: ["Back-projection", "Normals", "RANSAC"], outcome: "能把掩码和深度变成干净目标点云，并用可视化检查每一步。" },
  { index: 4, slug: "se3-transforms", phase: "几何", title: "SE(3) 与完整变换链", subtitle: "旋转表示、齐次变换、复合、求逆与 frame 记账", hours: "5h", level: "手推", tags: ["SE(3)", "Transform", "Quaternion"], outcome: "能在纸上和代码中正确完成 object→camera→base→grasp 的变换。" },
  { index: 5, slug: "detection-and-segmentation", phase: "估计", title: "2D 识别与分割前置", subtitle: "检测、实例分割、掩码裁云与是否需要深度学习", hours: "3h", level: "重点", tags: ["Detection", "Segmentation", "Mask"], outcome: "能选择与场景复杂度相称的目标定位方案，并把掩码安全地接到点云。" },
  { index: 6, slug: "classical-coarse-pose", phase: "估计", title: "经典几何粗位姿", subtitle: "LINEMOD、PPF、FPFH+RANSAC 与 PnP", hours: "6h", level: "手推", tags: ["PPF", "FPFH", "PnP"], outcome: "能根据 CAD、纹理与遮挡条件选择粗配准方法，并得到可供精配准使用的初值。" },
  { index: 7, slug: "learned-6d-pose", phase: "估计", title: "学习法 6D 位姿", subtitle: "实例级、类别级、未知物体设定与工程选型", hours: "4h", level: "重点", tags: ["PoseCNN", "FoundationPose", "Generalization"], outcome: "能按训练数据、CAD、算力、许可证和泛化边界选择学习方法。" },
  { index: 8, slug: "refinement-and-icp", phase: "估计", title: "精配准与 ICP", subtitle: "点到点、点到面、SVD 闭式解与鲁棒化", hours: "6h", level: "手推", tags: ["ICP", "SVD", "Refinement"], outcome: "能从粗位姿出发稳定精配准，并识别局部极小值和错误对应。" },
  { index: 9, slug: "apriltag", phase: "系统", title: "AprilTag 合作目标定位", subtitle: "已知身份目标的低成本 6D、PnP 与翻转歧义", hours: "2.5h", level: "重点", tags: ["AprilTag", "PnP", "Ambiguity"], outcome: "能搭建标签定位链，并用时序与几何约束处理姿态跳变。" },
  { index: 10, slug: "robotic-closed-loop", phase: "系统", title: "从位姿到抓取闭环", subtitle: "TF 树、ADD(-S)、误差预算、兜底与离线重放", hours: "7h", level: "综合", tags: ["Grasp", "Evaluation", "Replay"], outcome: "能交付可评测、可诊断、可回退的视觉抓取模块，而不只是一帧漂亮结果。" },
  { index: 11, slug: "learning-roadmap", phase: "实战", title: "两周、两月与半年路线", subtitle: "最短闭环、稳定可用、可上线扩展的分阶段验收", hours: "20h+", level: "综合", tags: ["Roadmap", "Project", "Delivery"], outcome: "能按阶段完成数据、算法、指标、故障归因和新物体接入交付。" },
];

export const getVisualPerceptionModule = (slug: string) =>
  visualPerceptionModules.find((item) => item.slug === slug);

export type VisualPerceptionStudyPlan = {
  objectives: string[];
  prerequisites: string[];
  timePlan: { minutes: number; task: string; output: string }[];
  debugging: string[];
};

export const visualPerceptionStudyPlans: Record<string, VisualPerceptionStudyPlan> = {
  "map-and-problem": {
    objectives: ["区分相机定位与物体定位", "用四步分解定位失败层", "为每个中间量声明 frame、unit 与 timestamp"],
    prerequisites: ["知道机器人 base、tool 与 camera 是不同坐标系", "准备一个自己熟悉的抓取或定位任务"],
    timePlan: [
      { minutes: 25, task: "阅读问题边界", output: "两类定位问题对照表" },
      { minutes: 35, task: "画四步视觉链", output: "输入—对应—位姿—机器人框图" },
      { minutes: 40, task: "拆解一次历史失败", output: "逐层证据与根因假设" },
      { minutes: 20, task: "闭卷自测", output: "带 frame/unit 的完整口述" },
    ],
    debugging: ["说不清矩阵方向时，先写成‘把哪个 frame 的点变到哪个 frame’", "无法归因时，补保存该层的输入和输出，不要继续调最终阈值"],
  },
  "imaging-and-depth": {
    objectives: ["从针孔模型推导投影与反投影", "解释视差误差为何随距离放大", "实测 RGB-D 对齐、空洞与长尾噪声"],
    prerequisites: ["高中相似三角形", "能读取相机内参与一帧原始深度"],
    timePlan: [
      { minutes: 45, task: "推导针孔与双目公式", output: "带单位的手写推导" },
      { minutes: 45, task: "核对设备流与内参", output: "分辨率—内参—depth scale 表" },
      { minutes: 100, task: "多距离采集平面", output: "原始/对齐深度数据" },
      { minutes: 35, task: "统计与画图", output: "偏差、方差、无效率曲线" },
      { minutes: 15, task: "制造单位错误并修复", output: "错误现象与门禁" },
    ],
    debugging: ["点云尺寸差 1000 倍，先查 depth scale 和米/毫米", "边缘出现背景墙，分别查看对齐前深度、彩色掩码和遮挡方向", "改变分辨率后异常，重新读取该 profile 的内参"],
  },
  calibration: {
    objectives: ["区分内参、逐帧目标外参与固定手眼外参", "从相对运动列出 AX=XB", "用留出姿态验证变换方向与标定质量"],
    prerequisites: ["完成 SE(3) 复合与求逆的预习", "机器人能输出同步的 base/tool 姿态", "准备尺寸可靠的标定板"],
    timePlan: [
      { minutes: 50, task: "画两种安装 TF 树", output: "固定量与变量清单" },
      { minutes: 60, task: "慢推 AX=XB 到列方程", output: "相对运动推导" },
      { minutes: 90, task: "采集多轴姿态", output: "含时间戳的标定集" },
      { minutes: 65, task: "求解与留出验证", output: "平移/旋转误差表" },
      { minutes: 35, task: "制造退化采集", output: "纯平移/共轴旋转对照" },
    ],
    debugging: ["结果差一个逆，拿一个已知实体点走完整正向链", "不同求解器都不稳定，先画旋转轴分布而不是继续换算法", "训练误差小但留出误差大，检查角点质量、同步和支架刚性"],
  },
  "depth-to-pointcloud": {
    objectives: ["逐项推导像素深度反投影", "理解法线与体素尺度的物理含义", "从掩码生成可配准的干净目标点云"],
    prerequisites: ["完成成像与深度相机章节", "会显示 RGB、depth 与 PLY 点云"],
    timePlan: [
      { minutes: 40, task: "手推并单测反投影", output: "3 个已知像素的三维答案" },
      { minutes: 55, task: "实现有效深度与掩码裁云", output: "原始目标点云" },
      { minutes: 55, task: "扫描体素与法线半径", output: "尺度对照可视化" },
      { minutes: 65, task: "平面分割与聚类", output: "逐步 PLY 与点数日志" },
      { minutes: 25, task: "闭卷复现", output: "从 depth 到点云的独立脚本" },
    ],
    debugging: ["点云左右或上下颠倒，检查 u/v 与 row/column", "点云发散，先可视化原始深度与相机内参对应关系", "法线混乱，检查邻域尺度、边缘跨越与朝向统一"],
  },
  "se3-transforms": {
    objectives: ["掌握齐次变换复合与逆", "正确处理旋转矩阵、四元数和欧拉角接口", "完成 object→camera→base→grasp 变换单测"],
    prerequisites: ["线性代数中的矩阵乘法与转置", "准备项目中真实的五个 frame 命名"],
    timePlan: [
      { minutes: 55, task: "慢推齐次变换和逆", output: "不看资料的手写推导" },
      { minutes: 45, task: "对比四种旋转表示", output: "接口约定卡片" },
      { minutes: 80, task: "实现 compose/inverse/points", output: "变换工具与单测" },
      { minutes: 75, task: "搭完整抓取链", output: "CAD 抓取点到 base 可视化" },
      { minutes: 45, task: "注入顺序和四元数错误", output: "错误症状—根因表" },
    ],
    debugging: ["任何异常先测 RᵀR、det(R)、TT⁻¹", "姿态方向怪异时显示三个单位轴，不只显示原点", "只有某个库接口错误时核对 xyzw/wxyz、行列向量与左右乘"],
  },
  "detection-and-segmentation": {
    objectives: ["根据输出粒度选择分类、检测或实例分割", "将 2D 掩码无错位地接到深度", "用端到端位姿结果比较规则法与学习法"],
    prerequisites: ["会读取彩色与对齐深度", "准备简单与复杂场景各一组样本"],
    timePlan: [
      { minutes: 35, task: "梳理输出粒度与任务需求", output: "选择条件表" },
      { minutes: 50, task: "实现规则基线", output: "颜色/深度/连通域掩码" },
      { minutes: 50, task: "运行实例分割", output: "同帧学习法掩码" },
      { minutes: 35, task: "比较三维污染和延迟", output: "端到端 A/B 报告" },
      { minutes: 10, task: "闭卷选型", output: "工程选择与边界" },
    ],
    debugging: ["2D 看着准但位姿差，查看掩码边缘对应的三维点", "同类目标串号，检查实例 ID 与跟踪逻辑", "规则法光照敏感，先量化失败域再决定是否换学习法"],
  },
  "classical-coarse-pose": {
    objectives: ["按输入条件区分 PPF、FPFH、模板与 PnP", "推导 PnP 重投影目标", "评估粗位姿进入 ICP 吸引域的比例"],
    prerequisites: ["完成点云与 SE(3) 章节", "准备 CAD 或可靠 3D 关键点"],
    timePlan: [
      { minutes: 55, task: "建立算法输入假设表", output: "按纹理/CAD/深度的决策树" },
      { minutes: 70, task: "慢推 PnP 与退化条件", output: "重投影公式和点布局图" },
      { minutes: 90, task: "跑通 PnP+RANSAC", output: "候选与重投影可视化" },
      { minutes: 100, task: "跑通 FPFH+RANSAC", output: "尺度扫描和 top-k 候选" },
      { minutes: 45, task: "接 ICP 并统计", output: "初值成功率对照" },
    ],
    debugging: ["PnP 跳变先画所有对应和内点，不先调优化器", "FPFH 候选随机，核对体素、法线与特征半径的相对尺度", "对称物体 top-1 低但 top-k 高，应按等价姿态和任务自由度评估"],
  },
  "learned-6d-pose": {
    objectives: ["明确实例级、类别级和未知物体设定", "核对模型的数据、CAD、许可证与部署边界", "用分层 benchmark 比较几何与学习方法"],
    prerequisites: ["至少跑通一个几何粗位姿 baseline", "准备独立于 demo 的测试集"],
    timePlan: [
      { minutes: 40, task: "阅读三种问题设定", output: "允许信息边界表" },
      { minutes: 45, task: "核对候选官方资料", output: "来源、权重、许可证记录" },
      { minutes: 90, task: "复现一个模型", output: "固定版本推理结果" },
      { minutes: 45, task: "做遮挡/背景/光照测试", output: "分层失败矩阵" },
      { minutes: 20, task: "完成选型复盘", output: "已确认/推测/未知清单" },
    ],
    debugging: ["官方 demo 成功但自有数据失败，先核对问题设定与输入预处理", "能力边界没有公开证据时标为暂无法验证", "显存或延迟不符时记录硬件、精度、分辨率和版本，不横向误比"],
  },
  "refinement-and-icp": {
    objectives: ["从对应与 SVD 推导点到点 ICP", "理解点到面目标和收敛盆地", "用遮挡、离群点和错误初值验证鲁棒性"],
    prerequisites: ["掌握刚体变换与 SVD 基础", "拥有同一物体的模型点云和场景点云"],
    timePlan: [
      { minutes: 75, task: "慢推去中心化与 SVD 解", output: "含 det 修正的推导" },
      { minutes: 85, task: "手写最小 ICP", output: "合成数据可运行实现" },
      { minutes: 65, task: "实现点到面与法线", output: "两种目标收敛曲线" },
      { minutes: 90, task: "扫描初值、遮挡和离群点", output: "成功率热图" },
      { minutes: 45, task: "加入门限与鲁棒核", output: "拒绝策略与对照" },
    ],
    debugging: ["第一轮就错，先显示对应线并检查 source/target 方向", "收敛但姿态错，检查对称、重复平面和内点覆盖", "点到面发散，检查法线尺度、方向与线性化增量"],
  },
  apriltag: {
    objectives: ["理解 ID、角点与 PnP 的完整链", "识别平面姿态翻转歧义", "用时序和几何约束稳定输出"],
    prerequisites: ["完成 PnP 与相机标定基础", "准备实测尺寸的标签"],
    timePlan: [
      { minutes: 30, task: "理解检测与位姿链", output: "角点顺序和 frame 图" },
      { minutes: 45, task: "采集多视角序列", output: "正视/斜视/运动数据" },
      { minutes: 40, task: "复现翻转并保留多解", output: "候选与重投影记录" },
      { minutes: 25, task: "加入时序/法向筛选", output: "翻转率对照" },
      { minutes: 10, task: "总结工作域", output: "距离与角度边界" },
    ],
    debugging: ["平移比例错先实测标签边长", "正视时翻转不要只加平滑，先保留 PnP 多解", "角点抖动检查曝光、打印质量、去畸变和像素尺寸"],
  },
  "robotic-closed-loop": {
    objectives: ["把物体位姿变为可执行抓取轨迹", "用 ADD(-S) 与任务指标联合评估", "构建带门禁、兜底和离线重放的服务"],
    prerequisites: ["前述相机、点云、SE(3) 与位姿模块至少各跑通一次", "机器人侧有速度、工作空间与碰撞保护"],
    timePlan: [
      { minutes: 60, task: "冻结 TF 与接口契约", output: "版本化 frame/unit/timestamp schema" },
      { minutes: 75, task: "实现抓取点变换与可视化", output: "object→base 抓取姿态" },
      { minutes: 75, task: "实现指标和误差预算", output: "ADD(-S)+任务指标表" },
      { minutes: 110, task: "加入门禁、重试和接管", output: "安全状态机" },
      { minutes: 70, task: "实现日志与离线重放", output: "一次失败的复盘包" },
      { minutes: 30, task: "故障注入验收", output: "越界/旧帧/错标定测试" },
    ],
    debugging: ["离线准、真机偏，分离相机/手眼/机器人/时延误差做基准", "偶发危险姿态先关闭执行，回放候选、门禁和 TF 版本", "成功率变化先按失败层分桶，不在全链上盲调一个置信阈值"],
  },
  "learning-roadmap": {
    objectives: ["用阶段验收替代模糊阅读时长", "完成从最短闭环到稳定系统的扩展", "把新物体 onboarding 变成可复制流程"],
    prerequisites: ["选定一个真实物体、相机和机器人/仿真任务", "能够为项目连续投入至少两周"],
    timePlan: [
      { minutes: 360, task: "两周里程碑：最短闭环", output: "单物体 20 次与逐帧日志" },
      { minutes: 420, task: "两月里程碑：评测与归因", output: "扰动集、两条 baseline、失败分类" },
      { minutes: 300, task: "半年里程碑：扩展与监控", output: "新物体接入脚本和运行监控" },
      { minutes: 120, task: "整理可复现交付", output: "安装、配置、数据卡和故障手册" },
    ],
    debugging: ["进度卡住时缩小到上一阶段验收场景，不同时扩展物体、相机和算法", "指标没有改善时先检查评测集与日志是否能分层", "接入新物体仍靠手工记忆时，把每一步输入、输出和默认参数写成脚本"],
  },
};

export const visualPerceptionLessons: Record<string, LessonDetail> = {
  "map-and-problem": {
    lead: "6D 位姿不是一个孤立网络的输出，而是一条从光、像素和深度，一直连接到机器人执行器的估计链。先画清问题，后面每个算法才有位置。",
    theory: [
      "物体 6D 位姿包含三维平移与三维旋转。工程链通常分四步：先回答目标是谁、在哪里；再建立观测与模型之间的对应；随后根据对应求出相机系位姿；最后把位姿变换到机器人 base，并叠加预先定义的抓取点。任何一步都可能输出数值正常但语义错误的结果。",
      "必须区分两个定位问题：相机或 AGV 在世界中的定位，以及物体相对相机的定位。固定工位抓取通常只需要后者加一条已标定的 camera→base 变换；只有当相机或底盘在移动、并且任务要求世界系一致性时，才需要外部定位或 SLAM 提供 world→camera。",
      "贯穿全篇的难点是数据关联。2D 检测框、分割掩码、关键点匹配、点云最近邻和 CAD 对应，本质上都在回答‘这个观测属于模型上的哪一点’。对应关系是离散选择，会因遮挡、重复纹理、对称和背景污染而突然跳错；后端优化无法把错误对应自动变正确。",
      "最有效的调试方式是逐层保存中间产物：原始 RGB/depth、对齐后的深度、掩码、目标点云、粗位姿、精配准残差和最终 TF。失败后离线重放，先定位是哪一层，再调整该层的输入、假设和阈值。",
    ],
    formula: {
      latex: String.raw`{}^{B}\mathbf T_{O}={}^B\mathbf T_C\;{}^C\mathbf T_O`,
      symbols: [
        { symbol: "B", meaning: "机器人 base 或任务参考坐标系。" },
        { symbol: "C", meaning: "相机光学坐标系。" },
        { symbol: "O", meaning: "物体或 CAD 模型坐标系。" },
        { symbol: "ᵃTᵦ", meaning: "把 B 系表达的点变换为 A 系表达。上下标方向必须贯穿全项目一致。" },
      ],
      note: "先写坐标系再写矩阵；若相邻上下标不能消去，变换链就是错的。",
    },
    practice: { title: "给现有视觉链画一张可诊断框图", summary: "选一个真实抓取任务，把输入、输出、frame、单位和中间日志全部标出来。", steps: ["列出传感器、目标、CAD 与机器人接口", "为每个张量标注 shape/frame/unit/timestamp", "给四步各设计一个可视化中间产物", "挑一次历史失败，沿图定位根因"], acceptance: ["任意位姿都能说清 from/to frame", "毫米与米没有混用", "能区分相机定位与物体定位", "失败可归到具体一层"], status: "配方核验" },
    pitfalls: ["把检测到物体等同于得到 6D 位姿", "看到矩阵数值正常就默认 frame 正确", "为了固定相机工位过早引入 SLAM", "只保存最终姿态而无法离线复盘"],
    review: ["6D 问题四步分解分别是什么？", "什么场景不需要 SLAM？", "为什么数据关联错误不能靠后端优化自动修好？"],
    completion: "不看教程，独立画出你的感知—坐标变换—抓取闭环，并给每层写出最小验收信号。",
    sources: [{ title: "原始 6D Pose 学习地图", url: "/tutorials/visual-perception/6dpose.html", role: "完整长版" }, { title: "ROS 2 tf2", url: "https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Tf2.html", role: "坐标系" }],
  },
  "imaging-and-depth": {
    lead: "相机没有直接测到三维点：RGB 来自透视投影，双目深度来自视差。理解这两层，才能解释为什么远处更抖、边缘会空洞。",
    theory: [
      "针孔模型把相机坐标 (X,Y,Z) 投影到像素 (u,v)。焦距以像素为单位，主点通常接近但不等于图像中心。内参只适用于对应的分辨率、裁剪和相机流；深度和彩色即使尺寸一样，也不能默认共用一套内参。",
      "主动双目通过红外纹理帮助左右相机找到对应点。视差 d 与深度成反比，因此同样一像素的匹配误差，在远距离会造成更大的 Z 误差。反光、透明、低纹理、遮挡边界和传感器量程边缘都会使误差远离单一高斯。",
      "RGB-D 对齐是用出厂内外参把深度点重投影到彩色图。D435 的彩色与双目模块物理分离，对齐后在遮挡边界可能出现空洞或背景深度；近距离 D405 的彩色来自同一双目系统，边界行为不同。选型要看工作距离、视场、最小深度和目标表面，而不是只比标称精度。",
      "深度图通常以整数单位存储，必须读取 depth scale 转为米。无效深度 0、饱和、飞点和时间不同步都要显式处理；中值滤波能去孤立噪声，但不能修复错误对应或遮挡几何。",
    ],
    formula: {
      latex: String.raw`u=f_x\frac{X}{Z}+c_x,\quad v=f_y\frac{Y}{Z}+c_y,\qquad Z=\frac{f_x b}{d}`,
      symbols: [
        { symbol: "(X,Y,Z)", meaning: "相机光学坐标系中的三维点。" },
        { symbol: "(u,v)", meaning: "像素列、行坐标。" },
        { symbol: "fₓ,fᵧ", meaning: "以像素计的水平、垂直焦距。" },
        { symbol: "cₓ,cᵧ", meaning: "主点坐标。" },
        { symbol: "b,d", meaning: "双目基线与视差；单位必须使 Z 一致。" },
      ],
      note: "由 Z=fb/d 可得 |∂Z/∂d|=Z²/(fb)，所以量化或匹配误差的深度影响近似随距离平方增长。",
    },
    practice: { title: "测出你自己的深度噪声曲线", summary: "对平面在多个距离采样，而不是照抄相机宣传页。", steps: ["读取真实内参与 depth scale", "在 0.2/0.5/1.0 m 等距离采集静态序列", "拟合平面并统计中心、边缘和遮挡边界残差", "分别保存原始与对齐后深度"], acceptance: ["反投影后平面尺寸正确", "误差按距离分桶报告", "无效深度单独计数", "能解释 align 前后边缘差异"], status: "配方核验" },
    pitfalls: ["把毫米深度直接当米", "彩色掩码配未对齐深度", "修改分辨率后沿用旧内参", "用均值掩盖空洞与长尾飞点"],
    review: ["为什么远距离深度误差更大？", "align 到彩色究竟做了什么？", "D435 的物体边缘为何容易取到背景深度？"],
    completion: "亲手反投影一个已知尺寸平面，并提交距离—偏差—方差—无效率四条曲线。",
    sources: [{ title: "Intel RealSense Projection", url: "https://dev.intelrealsense.com/docs/projection-in-intel-realsense-sdk-20", role: "投影与对齐" }, { title: "OpenCV Camera Calibration", url: "https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html", role: "成像模型" }],
  },
  "calibration": {
    lead: "标定是在估计一个固定几何关系；采集姿态是否有激励，往往比换求解器更重要。",
    theory: [
      "内参描述单个相机的投影，外参描述两个坐标系之间的刚体变换。深度到彩色的外参通常由设备提供，机器人项目还需要 camera↔base 或 camera↔tool。不要把棋盘格 PnP 得到的每帧 target→camera 与最终固定手眼外参混为一谈。",
      "eye-in-hand 中相机固定在末端，机器人运动时 camera→base 随之变化，而 tool→camera 固定；eye-to-hand 中相机固定在环境，base→camera 固定。两种安装对应的变换链和 AX=XB 变量不同，先画 TF 树再套 API。",
      "手眼标定利用多组相对运动。A 来自机器人末端在两次采样间的运动，B 来自标定板在相机中的相对运动，X 是未知固定外参。纯平移、旋转轴近似平行或运动幅度太小都会退化；应覆盖多个旋转轴和工作空间。",
      "标定完成后不能只看求解器返回值。要把标定板角点或已知点经完整变换链投到 base，做留出姿态验证；同时记录旋转误差与平移误差，并检查重装相机、改焦距、碰撞后是否需要重标。",
    ],
    formula: {
      latex: String.raw`\mathbf A_i\mathbf X=\mathbf X\mathbf B_i,\qquad \mathbf A_i=\mathbf T_{g,i}^{-1}\mathbf T_{g,j},\quad \mathbf B_i=\mathbf T_{c,i}\mathbf T_{c,j}^{-1}`,
      symbols: [
        { symbol: "Aᵢ", meaning: "两次采样之间的机器人相对运动。" },
        { symbol: "Bᵢ", meaning: "同两次采样之间标定目标相对相机的运动。" },
        { symbol: "X", meaning: "待求固定手眼变换；具体方向由你的坐标约定决定。" },
        { symbol: "Tg,Tc", meaning: "机器人与相机观测到的绝对姿态；时间必须对应。" },
      ],
      note: "不同库对输入/输出方向的定义不同。不要背这一个式子的下标，必须用一个真实点做正向验证。",
    },
    practice: { title: "完成一次可复验手眼标定", summary: "采集、求解、留出验证和退化对照缺一不可。", steps: ["画 eye-in-hand 或 eye-to-hand TF 树", "采集至少 15 个覆盖多轴旋转的姿态", "用两种求解法比较结果", "留出 20% 姿态验证完整变换链", "删除旋转激励后复现实验退化"], acceptance: ["时间戳可对应", "旋转轴至少覆盖两个方向", "报告平移和旋转留出误差", "能用实点验证矩阵方向"], status: "配方核验" },
    pitfalls: ["只移动不旋转", "把 base→tool 与 tool→base 传反", "标定集上看起来准就结束", "相机支架变化后继续用旧外参"],
    review: ["两种相机安装的固定变换分别是什么？", "为什么共轴旋转会让 AX=XB 退化？", "怎样验证不是矩阵方向恰好写反？"],
    completion: "交付标定数据、求解配置、留出误差表和一段由像素点走到 base 点的可复现实例。",
    sources: [{ title: "OpenCV Hand-Eye Calibration", url: "https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html", role: "求解接口" }, { title: "ROS Industrial Calibration", url: "https://github.com/ros-industrial/industrial_calibration", role: "工程实现" }],
  },
  "depth-to-pointcloud": {
    lead: "深度图是带拓扑的二维数组，点云是带坐标系的三维采样。反投影很简单，保证输入可靠才是本章重点。",
    theory: [
      "反投影由针孔模型直接求逆：先用深度得到 Z，再由内参恢复 X、Y。只对有效深度和目标掩码像素计算，可避免把整幅背景送入配准。结果必须带 camera frame 和米制单位。",
      "有序点云保留像素邻接，适合由深度图快速算法线与索引掩码；无序点云更通用。法线常由局部邻域平面拟合得到，邻域过小会跟随噪声，过大会跨越物体边缘；法线朝向也要统一。",
      "常用预处理顺序是 ROI/掩码裁剪、体素降采样、离群点剔除。体素大小必须小于任务关心的几何细节；统计滤波会删掉稀疏的真实结构，不是参数越强越好。每一步都要可视化点数和边界。",
      "桌面场景可先用 RANSAC 分割支撑平面，再对剩余点做欧氏聚类。RANSAC 阈值应来自实测深度噪声；聚类半径需和点云密度、目标间距联动。掩码已经可靠时，不要为了流程完整重复做强分割。",
    ],
    formula: {
      latex: String.raw`Z=D(u,v),\qquad X=\frac{(u-c_x)Z}{f_x},\qquad Y=\frac{(v-c_y)Z}{f_y}`,
      symbols: [
        { symbol: "D(u,v)", meaning: "像素处换算为米后的有效深度。" },
        { symbol: "X,Y,Z", meaning: "相机光学坐标系中的三维点。" },
        { symbol: "fₓ,fᵧ,cₓ,cᵧ", meaning: "与当前深度/对齐流匹配的内参。" },
      ],
      note: "若图像缩放了 s 倍，内参的焦距和主点也要按同一尺度调整。",
    },
    practice: { title: "从彩色掩码构造目标点云", summary: "保存每一步 PLY，肉眼检查比盲调阈值更快。", steps: ["将深度对齐到掩码所在图像流", "过滤 0/NaN/量程外深度并反投影", "体素降采样并估计法线", "可选分割桌面与聚类", "输出点数、包围盒、法线方向统计"], acceptance: ["三维尺寸与实物相符", "点云 frame/单位明确", "掩码边缘无明显背景墙", "参数变化影响可解释"], status: "配方核验" },
    pitfalls: ["u/v 和 row/column 写反", "对齐后仍使用原深度内参", "体素大于物体关键结构", "滤波后不看点云直接进入配准"],
    review: ["反投影为什么不需要求矩阵逆？", "法线邻域过大有什么后果？", "何时掩码裁云已经足够，不需要平面分割？"],
    completion: "用同一帧生成原始、裁剪、降采样和带法线四份点云，并解释点数与几何变化。",
    sources: [{ title: "Open3D Point Cloud", url: "https://www.open3d.org/docs/release/tutorial/geometry/pointcloud.html", role: "点云处理" }, { title: "PCL Tutorials", url: "https://pcl.readthedocs.io/projects/tutorials/en/latest/", role: "经典实现" }],
  },
  "se3-transforms": {
    lead: "大多数看似算法不准的问题，最后都是坐标系方向、旋转约定或单位错。SE(3) 是整条链的语法。",
    theory: [
      "齐次变换由旋转 R 与平移 t 组成，可一次性变换点并通过矩阵乘法复合。记号 ᵃTᵦ 表示把 B 系坐标变成 A 系坐标，则 ᵃp=ᵃTᵦ ᵦp；相邻 frame 可以像单位一样消去。",
      "逆变换不是简单对矩阵每项取负：旋转变为 Rᵀ，平移变为 −Rᵀt。复合顺序不可交换。写代码前先在纸上用 frame 下标检查，再用单位轴点做数值验证。",
      "旋转矩阵适合运算，四元数适合插值和接口，轴角适合表达单次旋转，欧拉角适合人读但有顺序约定和奇异性。四元数 q 与 −q 表示同一旋转；比较或平均前要处理符号连续性。",
      "李群李代数把局部 6D 增量映射到 SE(3)，在位姿优化和 ICP 中常见。入门阶段不必背完整 BCH，但必须知道平移向量依附于哪个 frame，以及左乘/右乘增量表达不同扰动约定。",
    ],
    formula: {
      latex: String.raw`\mathbf T=\begin{bmatrix}\mathbf R&\mathbf t\\\mathbf 0^\top&1\end{bmatrix},\qquad \mathbf T^{-1}=\begin{bmatrix}\mathbf R^\top&-\mathbf R^\top\mathbf t\\\mathbf 0^\top&1\end{bmatrix}`,
      symbols: [
        { symbol: "R", meaning: "3×3 正交旋转矩阵，det(R)=1。" },
        { symbol: "t", meaning: "目标原点在父坐标系中的平移。" },
        { symbol: "T⁻¹", meaning: "反方向坐标变换。" },
      ],
      note: "检查 RᵀR≈I、det(R)≈1、TT⁻¹≈I，是每次数据导入的最低门禁。",
    },
    practice: { title: "手推并单测一条抓取变换链", summary: "用合成坐标轴和真实姿态分别验证。", steps: ["定义 base、tool、camera、object、grasp 五个 frame", "手算两组简单旋转和平移", "实现 compose/inverse/transform_points", "将 CAD 抓取点变到 base", "故意交换一次乘法顺序并观察错误"], acceptance: ["矩阵逆单测通过", "单位轴方向符合预期", "四元数顺序有声明", "整条链的相邻下标可消去"], status: "已验证" },
    pitfalls: ["把 xyzw 当 wxyz", "欧拉角未声明内旋/外旋和顺序", "平移直接取负当作逆", "行向量与列向量库混用"],
    review: ["为什么逆变换的平移是 −Rᵀt？", "q 与 −q 的物理关系是什么？", "左乘和右乘一个小增量分别意味着什么？"],
    completion: "实现 20 个以上变换单测，并用一个真实抓取点从 CAD 一路变到 base 后可视化验证。",
    sources: [{ title: "Modern Robotics: Rigid-Body Motions", url: "https://modernrobotics.northwestern.edu/chapters/chapter3/", role: "SE(3)" }, { title: "ROS tf2 Quaternion Fundamentals", url: "https://docs.ros.org/en/rolling/Tutorials/Intermediate/Tf2/Quaternion-Fundamentals.html", role: "接口约定" }],
  },
  "detection-and-segmentation": {
    lead: "大多数 6D 求解器默认已经知道目标是谁、像素在哪。2D 前置负责缩小搜索空间，也决定送入后端的数据是否干净。",
    theory: [
      "分类只回答图中有什么，检测给出矩形框，实例分割给出每个实例的像素掩码。6D 场景通常需要实例级身份，尤其是同类多物体、堆叠和遮挡时。框内背景较多，掩码更适合裁点云，但掩码边缘误差也会直接变成三维飞点。",
      "深度学习不是默认答案。背景固定、颜色或几何差异明显时，颜色阈值、背景差分、深度 ROI 和连通域通常更容易校准、更快也更可解释。只有光照、纹理、类别和遮挡复杂度超过规则法边界时，再引入学习分割。",
      "掩码接深度前要保证时间、分辨率和坐标系一致。可对掩码轻微腐蚀减少边缘背景，但会损失细结构；膨胀适合补召回却会引入污染。应针对后端配准质量选择，而不是只追求 2D IoU。",
      "对称或外观相似目标需要把身份不确定性传给后端，必要时保留多个候选。检测置信度不是位姿置信度；高分掩码也可能因深度缺失无法支持 6D。",
    ],
    formula: {
      latex: String.raw`\mathcal P_O=\{\Pi^{-1}(u,v,D(u,v))\mid M(u,v)=1,\;D_{\min}<D(u,v)<D_{\max}\}`,
      symbols: [
        { symbol: "M", meaning: "与当前深度流对齐的实例掩码。" },
        { symbol: "Π⁻¹", meaning: "由内参与深度执行反投影。" },
        { symbol: "Pᴏ", meaning: "目标候选点云。" },
        { symbol: "Dmin,Dmax", meaning: "依据工作空间设置的深度门限。" },
      ],
    },
    practice: { title: "规则法与学习法做同场景 A/B", summary: "评估最终位姿，不只评估漂亮掩码。", steps: ["建立颜色/深度/连通域基线", "准备至少三种光照与两种遮挡", "运行实例分割模型", "用相同后端比较点云污染和位姿成功率", "记录延迟与失败类型"], acceptance: ["同类多实例不会串号", "掩码和深度严格对齐", "报告端到端位姿成功率", "选择理由包含维护成本"], status: "配方核验" },
    pitfalls: ["只看 2D IoU 不看三维污染", "检测框直接包含大面积桌面", "分割输出与深度相差一帧", "场景简单仍引入难以维护的大模型"],
    review: ["检测框和实例掩码对点云后端的差别是什么？", "什么场景规则法更合适？", "为什么检测置信度不能当位姿置信度？"],
    completion: "用同一数据集比较规则与学习分割，按端到端成功率、延迟、标注成本和可维护性做选型。",
    sources: [{ title: "OpenCV Image Segmentation", url: "https://docs.opencv.org/4.x/d3/db4/tutorial_py_watershed.html", role: "规则基线" }, { title: "Segment Anything", url: "https://github.com/facebookresearch/segment-anything", role: "通用分割" }],
  },
  "classical-coarse-pose": {
    lead: "粗位姿的目标不是最后一毫米，而是从大范围搜索中进入正确吸引域。是否有纹理、CAD 和可靠对应决定算法路线。",
    theory: [
      "LINEMOD 用颜色梯度和表面法线模板匹配，适合已知物体与可控视角，但模板数量随姿态覆盖增长。PPF 用模型与场景点对的距离和法线夹角投票，对低纹理刚体友好，是许多工业 3D 匹配器的重要思想。",
      "FPFH 描述局部几何，配合 RANSAC 或 fast global registration 在模型点云与场景点云间搜索全局刚体变换。它依赖足够独特的三维形状、合理法线和采样尺度；光滑圆柱、平面件和强遮挡会产生大量歧义。",
      "PnP 适用于已知三维关键点与二维像素对应，通过重投影误差求相机位姿。至少需要足够的非退化对应，平面点、共线点和错误匹配会降低稳定性；工程上常结合 RANSAC 与后续非线性优化。",
      "算法选择先问输入条件：有 CAD 和深度可用 PPF/FPFH；有稳定纹理或关键点可用 PnP；场景固定且视角有限可用模板；强对称物体应输出等价姿态集合或把对称轴自由度交给任务处理。",
    ],
    formula: {
      latex: String.raw`\hat{\mathbf T}=\arg\min_{\mathbf T}\sum_i\rho\!\left(\left\|\mathbf u_i-\pi(\mathbf K\mathbf T\mathbf P_i)\right\|_2^2\right)`,
      symbols: [
        { symbol: "Pᵢ", meaning: "物体/CAD 坐标系中的三维关键点。" },
        { symbol: "uᵢ", meaning: "图像中的对应二维像素。" },
        { symbol: "K", meaning: "相机内参。" },
        { symbol: "T", meaning: "待求 object→camera 位姿。" },
        { symbol: "ρ", meaning: "降低错误对应影响的鲁棒损失。" },
      ],
      note: "PnP 的关键不是求解器名字，而是对应质量、点的空间分布和相机模型是否一致。",
    },
    practice: { title: "用两条路线求同一物体粗位姿", summary: "推荐 PnP 与 FPFH+RANSAC 各做一次，建立输入假设感。", steps: ["准备 CAD/模型点云与相机数据", "为 PnP 建立 2D-3D 对应并画重投影", "为 FPFH 选择体素和法线半径", "RANSAC 输出多个候选并排序", "交给同一个 ICP 后端比较"], acceptance: ["粗姿态进入 ICP 吸引域", "重投影与三维对齐均可视化", "对称姿态按等价类评估", "记录耗时和候选数"], status: "配方核验" },
    pitfalls: ["把局部特征匹配当精配准", "关键点集中在一小块或近共线", "法线方向随机却使用 PPF", "只保留一个候选导致对称物体跳变"],
    review: ["PPF 与 FPFH 分别依赖什么几何信息？", "PnP 的退化构型有哪些？", "粗位姿为何允许不够精，但不能落入错误吸引域？"],
    completion: "在含遮挡和干扰物的数据上报告 top-1/top-k 初值进入 ICP 吸引域的比例，而不只展示单帧。",
    sources: [{ title: "OpenCV solvePnP", url: "https://docs.opencv.org/4.x/d5/d1f/calib3d_solvePnP.html", role: "PnP" }, { title: "Open3D Global Registration", url: "https://www.open3d.org/docs/release/tutorial/pipelines/global_registration.html", role: "FPFH+RANSAC" }],
  },
  "learned-6d-pose": {
    lead: "学习法用数据换取遮挡、杂乱和外观变化下的泛化，但必须先分清实例级、类别级和未知物体三种不同承诺。",
    theory: [
      "实例级方法在训练或部署前知道具体物体，通常可利用 CAD、合成渲染或目标参考图；类别级方法要对同类未见实例预测规范坐标或姿态；未知物体方法尝试借助通用视觉/几何特征与少量参考完成定位。三者的数据需求和可评测边界不同。",
      "常见流水线仍是检测/分割、生成位姿候选、渲染或几何打分、迭代 refinement。学习法没有消灭坐标系、相机模型和对称问题，只是把部分对应与评分交给网络。训练集纹理、背景和姿态覆盖会定义模型的真实工作域。",
      "工程选型必须同时看：是否需要 CAD、每个物体是否训练、RGB 或 RGB-D、GPU 显存与延迟、许可证、是否支持对称、输出置信度能否校准、代码和权重是否真的开放。论文榜单不能替代这些约束。",
      "评估时应按遮挡、距离、反光、实例和场景分层，并与 PnP/PPF/ICP 基线比较。学习模型对背景捷径和合成—真实域差尤其敏感，因此要做遮挡、换背景、换光照与深度缺失测试。",
    ],
    formula: {
      latex: String.raw`\mathcal L=\lambda_t\lVert\hat{\mathbf t}-\mathbf t^*\rVert_1+\lambda_R\,d_{SO(3)}(\hat{\mathbf R},\mathbf R^*)+\lambda_s\mathcal L_{\rm score}`,
      symbols: [
        { symbol: "t,R", meaning: "预测与真值的平移、旋转。" },
        { symbol: "dSO(3)", meaning: "考虑旋转几何的距离；对称物体需取等价姿态最小值。" },
        { symbol: "Lscore", meaning: "候选置信度、渲染一致性或排序损失。" },
        { symbol: "λ", meaning: "平衡不同量纲与任务的权重。" },
      ],
      note: "这是通用结构，不代表所有模型共享同一损失。读论文时要核对它监督的是坐标、关键点、位姿还是渲染一致性。",
    },
    practice: { title: "做一张可落地的模型选型表", summary: "用自己的工件和硬件条件筛选，而不是按热度排名。", steps: ["声明实例/类别/未知物体设定", "列 CAD、参考图、训练与标注需求", "核对官方许可证、权重和显存", "在固定测试集跑几何 baseline 与学习模型", "分层记录失败并校准置信度"], acceptance: ["设定没有混用", "官方仓库版本可复现", "有传统几何 baseline", "失败按场景因素分层"], status: "配方核验" },
    pitfalls: ["把类别级结果宣传成未知物体泛化", "只看论文平均分", "忽略许可证与闭源依赖", "网络输出位姿后不做几何验证"],
    review: ["三种 6D 设定分别允许预先知道什么？", "学习法为什么仍需要坐标系和相机标定？", "什么消融能发现背景捷径？"],
    completion: "提交一页选型决策树和分层 benchmark，明确 baseline、适用域、资源与不可接受失败。",
    sources: [{ title: "BOP Benchmark", url: "https://bop.felk.cvut.cz/", role: "评测" }, { title: "FoundationPose", url: "https://github.com/NVlabs/FoundationPose", role: "参考实现" }],
  },
  "refinement-and-icp": {
    lead: "ICP 是局部优化器：有好初值时能把粗位姿磨准，没有好初值时会自信地收敛到错误位置。",
    theory: [
      "ICP 交替执行两步：按当前位姿建立模型点与场景点对应，再求使对应误差最小的刚体变换。点到点目标可通过去中心化、计算互协方差和 SVD 得到闭式解；迭代直到增量或残差收敛。",
      "点到面 ICP 最小化误差在目标法线方向的分量，平滑表面附近通常收敛更快，也是工业实现常见默认。它依赖可靠法线；若法线跨边缘、方向混乱或场景点云太稀，优势会消失。",
      "粗+精两段式是工程标配：全局方法负责进入正确吸引域，ICP 负责局部毫米级调整。最近邻距离门限、法线夹角、互惠对应、trimmed ICP 和鲁棒核用于拒绝遮挡、背景和不重叠区域。",
      "不要只看最终 fitness。还要记录 inlier RMSE、内点比例、迭代增量、可见表面覆盖和候选间差距；对称物体需要 ADD-S 或任务相关指标。残差小可能只是模型贴到了错误的相似平面。",
    ],
    formula: {
      latex: String.raw`\min_{\mathbf R,\mathbf t}\sum_i w_i\left\|\mathbf q_i-(\mathbf R\mathbf p_i+\mathbf t)\right\|_2^2,\qquad \mathbf R=\mathbf V\operatorname{diag}(1,1,\det(\mathbf V\mathbf U^\top))\mathbf U^\top`,
      symbols: [
        { symbol: "pᵢ,qᵢ", meaning: "模型与场景中的当前对应点。" },
        { symbol: "wᵢ", meaning: "门限、鲁棒核或置信度产生的权重。" },
        { symbol: "UΣVᵀ", meaning: "去中心化互协方差的 SVD。" },
        { symbol: "R,t", meaning: "本轮最优刚体增量。" },
      ],
      note: "det 修正确保 R 是旋转而非反射；平移由两组点的质心关系恢复。",
    },
    practice: { title: "从零实现点到点 ICP，再对照 Open3D", summary: "手写小版本理解机制，库版本完成工程鲁棒化。", steps: ["生成带已知 SE(3) 的合成点云", "实现最近邻、SVD 刚体配准和迭代", "扫描初始旋转/平移误差", "加入 30% 遮挡与离群点", "比较点到点、点到面和鲁棒核"], acceptance: ["无噪声时恢复真值", "报告收敛盆地", "遮挡时不被背景拖走", "拒绝低内点率结果"], status: "已验证" },
    pitfalls: ["任意初值直接跑 ICP", "把 fitness 当绝对可信度", "法线估计半径与点间距不匹配", "对称物体用普通旋转误差判错"],
    review: ["ICP 为什么是交替优化？", "点到面为何通常收敛更快？", "残差小但位姿错可能由什么造成？"],
    completion: "画出初始误差—成功率热图，并证明你的粗位姿模块大部分输出落在 ICP 收敛盆地内。",
    sources: [{ title: "Open3D ICP Registration", url: "https://www.open3d.org/docs/release/tutorial/pipelines/icp_registration.html", role: "工程实现" }, { title: "Besl & McKay ICP", url: "https://doi.org/10.1109/34.121791", role: "经典论文" }],
  },
  "apriltag": {
    lead: "当目标允许贴标签时，AprilTag 用可观测身份和四个已知角点换来稳定 6D，是应该认真考虑的工程捷径。",
    theory: [
      "AprilTag 检测先找四边形，再解码内部编码得到 tag ID 与角点顺序。已知标签物理尺寸后，四个平面 3D 角点与图像角点构成 PnP，可以得到 tag→camera。ID 同时解决了数据关联问题。",
      "平面方形目标在正视、远距离、低分辨率时可能存在两个近似姿态解，表现为法向翻转或姿态跳变。单帧 reprojection error 未必能分开；可用 IPPE 多解、正深度、法向先验、上一帧和机器人运动连续性筛选。",
      "标签位姿仍依赖正确内参、去畸变、角点精度和真实 tag size。打印缩放、覆膜反光、弯曲和粗边框都会引入系统误差；相机曝光过长会让移动时角点拖影。",
      "如果标签贴在工装而非目标，可通过已知 tag→object 外参连接到物体。多个标签板能提高可见性与稳定性，但必须整体标定板几何并处理 ID 配置版本。",
    ],
    formula: {
      latex: String.raw`{}^C\mathbf T_O={}^C\mathbf T_{Tag}\;{}^{Tag}\mathbf T_O`,
      symbols: [
        { symbol: "ᶜTTag", meaning: "由角点 PnP 得到的标签相对相机位姿。" },
        { symbol: "TagTᴏ", meaning: "标签与真实目标之间预先测得的固定变换。" },
        { symbol: "ᶜTᴏ", meaning: "最终物体相对相机位姿。" },
      ],
    },
    practice: { title: "复现并消除一次姿态翻转", summary: "从正视远距离开始，逐步加入多解与时序约束。", steps: ["实测并填写 tag 边长", "采集正视、斜视、移动序列", "保存所有 PnP 候选与重投影误差", "加入正深度、法向和上一帧门限", "测量 tag→object 固定变换"], acceptance: ["ID 与角点顺序稳定", "无明显法向翻转", "打印尺寸误差被量化", "失去标签时有明确无效状态"], status: "配方核验" },
    pitfalls: ["填写打印前的设计尺寸而非实测尺寸", "只取 solvePnP 第一个解", "用滤波掩盖偶发翻转", "tag→object 外参靠目测"],
    review: ["AprilTag 为什么同时简化识别和位姿？", "平面 PnP 为什么有翻转歧义？", "何时应该贴标签而不是训练 6D 网络？"],
    completion: "在完整工作空间采集序列，报告丢检率、翻转率、平移/旋转抖动和端到端抓取成功率。",
    sources: [{ title: "AprilTag 3", url: "https://github.com/AprilRobotics/apriltag", role: "官方实现" }, { title: "OpenCV IPPE", url: "https://docs.opencv.org/4.x/d5/d1f/calib3d_solvePnP.html", role: "平面多解" }],
  },
  "robotic-closed-loop": {
    lead: "一帧位姿不是产品。真正可用的系统必须知道何时相信、如何执行、失败后留下什么证据，以及谁能接管。",
    theory: [
      "完整 TF 链至少包含 base、tool、camera、object 和 grasp。抓取点应在 CAD/object frame 中定义，再经 object→camera 与 camera→base 变换到机器人；预抓取、接近方向和夹爪姿态也应绑定 object frame，而非写死在世界系。",
      "ADD 衡量模型点在预测与真值位姿下的平均距离；ADD-S 对每个预测点找最近真值点，适合对称物体。离线位姿指标必须与任务指标配对：抓取成功、碰撞、超时、重试和恢复。毫米级 ADD 不保证夹爪可达或避障。",
      "误差预算要按来源分层：深度随机噪声、分割边缘、粗配准、ICP、内参、手眼外参、机器人重复定位和时间同步。随机项可能通过多帧平均下降，系统偏差不会；旋转误差在较长抓取臂长处会放大成平移偏差。",
      "上线系统需要门禁与兜底：工作空间、点数、深度覆盖、内点率、残差、姿态跳变、时间戳、碰撞检查；低置信时重拍、换视角、使用第二候选或人工接管。每帧应打包原始输入、校准版本、参数、候选、指标和最终决策，支持离线确定性重放。",
    ],
    formula: {
      latex: String.raw`\operatorname{ADD}=\frac1{|\mathcal M|}\sum_{\mathbf x\in\mathcal M}\left\|(\hat{\mathbf R}\mathbf x+\hat{\mathbf t})-(\mathbf R^*\mathbf x+\mathbf t^*)\right\|_2`,
      symbols: [
        { symbol: "M", meaning: "CAD 模型点集。" },
        { symbol: "R̂,t̂", meaning: "预测位姿。" },
        { symbol: "R*,t*", meaning: "真值位姿。" },
        { symbol: "ADD-S", meaning: "将同索引距离换为最近邻距离，处理对称等价。" },
      ],
      note: "指标阈值常按物体直径比例设置，但抓取项目还要按夹爪余量制定任务阈值。",
    },
    practice: { title: "构建可离线重放的抓取视觉服务", summary: "把一次推理变成有输入契约、门禁、决策和证据的数据产品。", steps: ["冻结相机/手眼/抓取点版本", "实现全链 TF 与时间戳检查", "输出位姿候选和质量指标", "注入空洞、错掩码、旧帧和外参偏差", "离线重放并自动生成失败报告"], acceptance: ["异常不会下发危险姿态", "同一输入可确定性重放", "错误可归因到具体层", "报告任务成功率与 ADD(-S)", "存在重拍/接管策略"], status: "云端必做" },
    pitfalls: ["只在 RViz 看起来对就上线", "把模型置信度直接当安全门禁", "标定版本未写进日志", "只报告成功率不统计重试与碰撞"],
    review: ["ADD-S 为什么适合对称物体？", "哪些误差能多帧平均，哪些不能？", "离线重放包至少包含哪些字段？"],
    completion: "另一位工程师仅凭数据包即可复现失败、定位层级并验证修复，机器人端对过期或越界位姿会拒绝执行。",
    sources: [{ title: "BOP Evaluation", url: "https://bop.felk.cvut.cz/challenges/", role: "位姿指标" }, { title: "ROS 2 tf2", url: "https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Tf2.html", role: "系统坐标" }],
  },
  "learning-roadmap": {
    lead: "学习节奏按可交付闭环组织：两周建立手感，两月做到稳定与可归因，半年再追求上线和快速扩展。",
    theory: [
      "前两周只做最短闭环：固定相机、单一不透明刚体、简单背景、规则分割或 AprilTag、反投影、一个粗位姿方法、ICP 和 base 变换。目标不是模型先进，而是从像素到夹爪完整走一遍，并建立 frame/unit/timestamp 习惯。",
      "两个月阶段扩大到真实杂乱台面：多物体、遮挡、光照和距离变化；建立带真值或高质量参考的评测集，比较 PnP/PPF/FPFH 与一个学习法，完成手眼重标定、对称处理、误差预算和失败分类。",
      "半年阶段才考虑多工件快速 onboarding、自动数据采集、模型服务、GPU/CPU 降级、在线监控和生产节拍。把新增一类耗材所需 CAD、抓取点、参数、验证时间作为核心工程指标，而不是持续增加网络复杂度。",
      "工具链建议保持可替换：OpenCV 管相机几何与 PnP，Open3D/PCL 管点云与配准，ROS 2/tf2 管坐标和消息，RealSense SDK 管设备；训练模型用独立环境或服务隔离，避免把研究依赖耦合进机器人主控。",
    ],
    formula: {
      latex: String.raw`E_{\rm total}\approx E_{\rm depth}+E_{\rm mask}+E_{\rm pose}+L\,E_{\rm rot}+E_{\rm handeye}+E_{\rm robot}`,
      symbols: [
        { symbol: "Etotal", meaning: "抓取点附近的总位置误差近似预算。" },
        { symbol: "Edepth,Emask,Epose", meaning: "深度、分割和位姿求解贡献。" },
        { symbol: "Erot", meaning: "小角度旋转误差（弧度）。" },
        { symbol: "L", meaning: "从旋转中心到关键抓取点的杠杆臂长度。" },
        { symbol: "Ehandeye,Erobot", meaning: "手眼标定与机器人本体贡献。" },
      ],
      note: "这是用于定位主导项的保守一阶预算，不等于统计上严格独立相加；实测时应分别做偏置与方差分析。",
    },
    practice: { title: "分三阶段完成一个新物体 onboarding", summary: "以验收物而非阅读时长作为学习进度。", steps: ["两周：单物体 20 次闭环与逐帧日志", "两月：三类扰动、两条 baseline、200 次分层评测", "半年：新增物体流程自动化与运行监控", "整理安装脚本、配置、数据卡和故障手册"], acceptance: ["两周：能稳定复现基本闭环", "两月：每次失败可归因", "半年：新增物体接入少于 1 天", "结果由独立测试集支持", "交付可由他人复现"], status: "云端必做" },
    pitfalls: ["先读半年论文再接相机", "第一版同时解决移动相机和未知物体", "没有验收集就频繁换模型", "把研究环境直接装进机器人主控"],
    review: ["为什么第一阶段应刻意缩小场景？", "两个月阶段新增的核心能力是什么？", "半年阶段为什么用 onboarding 时间衡量扩展性？"],
    completion: "提交一个可运行仓库、版本化标定、固定评测集、三阶段报告和新物体接入手册。",
    sources: [{ title: "原始学习路线与公式总表", url: "/tutorials/visual-perception/6dpose.html", role: "完整长版" }, { title: "OpenCV", url: "https://docs.opencv.org/4.x/", role: "视觉工具" }, { title: "Open3D", url: "https://www.open3d.org/docs/release/", role: "点云工具" }],
  },
};
