# Robotics Notebook

匿名的运动控制与具身智能个人技术网站，基于 [PRISM](https://github.com/xyjoey/PRISM) 改造，使用 Next.js 静态导出并通过 GitHub Pages 免费托管。

## 内容

- 匿名个人首页、学习中心、项目与关于页面
- 18 章 VLA 中文课程，使用统一贯穿案例和章节交付链
- π₀.₅、Flow Matching、VLA 发展史、世界模型与前沿方向
- 公式逐项注释、原理图解、失效模式与自测
- 13 个可下载且可直接运行的 Python 最小实验
- 三门按原课顺序整理的中文课程：MIT Diffusion/Flow、Stanford CS336 与 Berkeley CS285

## 本地验证

```bash
npm ci
npm run build

python public/labs/action_tokenizer.py
python public/labs/chunked_controller.py
python public/labs/flow_matching_1d.py
python public/labs/toy_behavior_cloning.py
```

以上是最短 smoke 集；完整 13 个实验及其预期输出、故障注入和验证边界见网站的“VLA → 实操工坊”。

静态产物输出至 `out/`。仓库内置 GitHub Actions：上传源码后，在仓库 `Settings → Pages` 中将 `Source` 设为 `GitHub Actions`；之后每次推送到 `main` 都会自动构建并发布。

## 隐私

站点不公开真实姓名、头像、邮箱、公司、学校或地点。后续若要公开任一字段，应先修改 `content/config.toml` 并执行隐私扫描。

## License

本项目保留 PRISM 原项目的 MIT License 与版权声明。

课程讲义、slides、录像和作业材料仍归原作者所有；不同课程的署名、许可和改编边界见 [THIRD_PARTY_COURSES.md](./THIRD_PARTY_COURSES.md)，原始资料到本站章节的核对记录见 [COURSE_SOURCE_AUDIT.md](./COURSE_SOURCE_AUDIT.md)。
