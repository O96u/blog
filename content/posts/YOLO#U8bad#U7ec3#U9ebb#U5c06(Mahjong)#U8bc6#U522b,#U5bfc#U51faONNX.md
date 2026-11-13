---
slug: yolo-mahjong-onnx-export
title: YOLO训练麻将(Mahjong)识别,导出ONNX
description: 本文基于 Roboflow Universe 数据集（例如 $1 ）与仓库内脚本，在 Windows 上完成训练，并导出 ONNX 供后端推理。下文配图均为本机实测截图，便于对照。快速体验 小程序 1\. 环境要求 \ Windows 10
date: 2026-04-20
updated: 2026-04-24
draft: false
pinned: false
tags:
  - opensource
  - yolo
cover: https://s.muxui.com:8015/images/2026/09/LaZjOhH2IHgF.jpg
toc: true
comments: true
searchable: true
---




> 本文基于 **Roboflow Universe** 数据集（例如
>
> [http://(https://universe.roboflow.com/jon-chan-gnsoa/mahjong-baq4s"](http://(https://universe.roboflow.com/jon-chan-gnsoa/mahjong-baq4s)
>
> ）与仓库内脚本，在 **Windows** 上完成训练，并导出 **ONNX** 供后端推理。下文配图均为本机实测截图，便于对照。快速体验
>
> ![](https://s.muxui.com:8015/images/2026/09/06WJKxg0YT8t.webp)
>
> 小程序

## **1\. 环境要求**

\- Windows 10 / 11  

\- Python **3.10 或 3.11** 

\- **NVIDIA 显卡**：建议已安装 CUDA 驱动；训练阶段 GPU 会持续高占用  

命令行自检：

```text
nvidia-smi
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'no gpu')"
```

训练中若希望直观确认显卡是否在干活，可打开 **\*\*任务管理器 → 性能 → GPU\*\***。下图为本机训练时 **\*\*RTX 3070\*\*** 的占用：**\*\*利用率接近满载、专用显存占用约数 GB\*\***，说明计算确实在显卡上跑（温度因机型与散热而异，只要在合理区间即可）。

![](https://s.muxui.com:8015/images/2026/09/VMf6QansJiTP.webp)

## **2\. 安装依赖**

在 **Mahjong_YOLO 根目录**：

```bash
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## **3\. 数据与类别**

目录约定（Roboflow 导出常见结构）：

```bash
dataset/
  train/images/    train/labels/
  valid/images/    valid/labels/
  test/images/     test/labels/
  data.yaml
```

\- **类别数与名称**以 \`dataset/data.yaml\` 为准（示例工程为 **42 类**，\`nc: 42\`）。  

\- 标签为 **YOLO 检测格式**，每行：\`class_id x_center y_center width height\`（均为 0～1 归一化坐标）。

## **4\. 训练前：标签体检**

在根目录、已激活 \`.venv\`：

```bash
python scripts/check_labels.py --data dataset/data.yaml --num-classes 42 --show-bad-samples 15
```

若误用 **分割标注** 当检测，可能出现大量 \`invalid_lines\`，可先：

```bash
python scripts/convert_seg_labels_to_det.py --dataset-root dataset
python scripts/check_labels.py --data dataset/data.yaml --num-classes 42 --show-bad-samples 15
```

## **5\. 第一轮训练：YOLOv8n 跑通**

```bash
python scripts/train.py --data dataset/data.yaml --model yolov8n.pt --imgsz 960 --epochs 80 --batch 8 --workers 2 --device 0 --name mahjong_42cls_n
```

显存紧张时可改为更小输入、更小 batch，例如：

```bash
python scripts/train.py --data dataset/data.yaml --model yolov8n.pt --imgsz 640 --epochs 80 --batch 4 --workers 0 --device 0 --name mahjong_42cls_n_safe
```

终端里应能看到：**验证集路径、\`save_dir\`、优化器、TensorBoard 提示、当前 epoch 进度条、GPU 显存占用、各项 loss** 等。下图示例为 **第 1 轮训练进行中**（路径中的 \`mahjong_42cls_n\` 即本次 \`--name\`，具体以你机器打印为准）。

![](https://s.muxui.com:8015/images/2026/09/EAyIJ2fQSmNp.webp)

## **6\. 训练输出目录（务必核对）**

默认输出在：

```bash
runs/detect/<run_name>/
```

\`<run_name>\` 对应你传入的 \`--name\`。若同名目录已存在，Ultralytics 往往会自动顺延为 \`mahjong_42cls_n2\`、\`mahjong_42cls_n3\` 等，**请以终端里的 \`save_dir\` 或 \`runs/detect\` 下实际文件夹为准**。

常用文件：

<table class="has-fixed-layout"><tbody><tr><td>路径</td><td>说明</td></tr><tr><td><code>runs/detect/&lt;run_name&gt;/weights/best.pt</code></td><td>验证集上表现最佳的权重，<strong>导出 ONNX 首选</strong></td></tr><tr><td><code>runs/detect/&lt;run_name&gt;/results.csv</code></td><td>每 epoch 指标，便于脚本汇总或自行画图</td></tr></tbody></table>

训练结束后可看摘要：

```bash
python scripts/show_train_summary.py --results-csv runs/detect/<run_name>/results.csv
```

训练中另开终端可选：

```bash
python scripts/watch_train.py --results-csv runs/detect/<run_name>/results.csv --interval 5 --idle-timeout 180
```

## **7\. TensorBoard：曲线与计算图**

安装并开启 TensorBoard 日志（若尚未配置）：

```bash
pip install tensorboard
yolo settings tensorboard=True
tensorboard --logdir runs\detect\<run_name> --port 6006
```

浏览器访问：\`http://localhost:6006\`。左侧 **Runs** 中选择对应目录（例如界面中的 \`detect/mahjong_42cls_n\`）。

**GRAPHS** 页可查看模型数据流概览（input → DetectionModel → output），用于确认当前跑的是检测结构、日志是否挂在本次 run 上：

![](https://s.muxui.com:8015/images/2026/09/lN749Hh67gQG.webp)

**SCALARS** 页重点看 **lr**（学习率调度是否如预期）、**metrics**（mAP50、mAP50-95、precision、recall）。训练初期曲线通常整体向上；若长期横盘或发散，再回头查数据与超参。

![](https://s.muxui.com:8015/images/2026/09/VynrLCvXNN9w.webp)

同一 run 在训练后期，指标会趋于稳定。下图示例中可见 **mAP50、mAP50-95、precision、recall** 等读数（具体数值随数据与随机种子变化，以你本地 \`results.csv\` 为准）。

![](https://s.muxui.com:8015/images/2026/09/IiQ6j1Wn5KH5.webp)

## **8\. 第二轮（可选）：换更大模型提精度**

第一轮流程与指标正常后，可再跑例如 YOLOv8s、加长 epoch：

```bash
python scripts/train.py --data dataset/data.yaml --model yolov8s.pt --imgsz 960 --epochs 150 --batch 8 --workers 2 --device 0 --name mahjong_42cls_s
```

同样注意 **输出目录名是否带 \`2\` 后缀**。

## **9\. 导出 ONNX**

将 \`--weights\` 换成你选定的那次训练的 \`best.pt\`，**\`--imgsz\` 与训练一致**，便于与后端输入尺寸（如 \`MAHJONG_OCR_IMGSZ\`）对齐：

```bash
python scripts/export_onnx.py --weights runs/detect/mahjong_42cls_s/weights/best.pt --imgsz 960 --opset 12 --dynamic
```

产物示例：\`artifacts/best.onnx\`。类别文件复制给后端使用：

```bash
copy tools\label_classes.txt artifacts\classes.txt
```

## **\## 10. ONNX 快速验证**

```bash
python scripts/predict_onnx_check.py --onnx artifacts/best.onnx --source dataset/test/images --imgsz 960 --conf 0.35 --iou 0.55 --device 0
```

可视化一般在 \`artifacts/onnx_check/pred/\`。若几乎全空或误检爆炸，先调 \`conf\`/\`iou\`，再核对预处理与类别顺序是否与训练一致。

## 开源地址


[GitHub：O96u/Mahjong_YOLO](https://github.com/O96u/Mahjong_YOLO)
