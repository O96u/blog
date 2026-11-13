---
slug: java-thread-pool-guide
title: Java线程池
description: 总体设计 ThreadPoolExecutor实现的顶层接口是Executor，顶层接口Executor提供了一种思想：将任务提交和任务执行进行解耦。用户无需关注如何创建线程，如何调度线程来执行任务，用户只需提供Runnable对象，将任务
date: 2025-06-23
updated: 2025-06-24
draft: false
pinned: false
tags:
  - java
cover: https://s.muxui.com:8015/images/2026/09/8e8t7ONN0FKz.webp
toc: true
comments: true
searchable: true
---




## 总体设计

![](https://s.muxui.com:8015/images/2026/09/sigvVuLkZevq.webp)

ThreadPoolExecutor实现的顶层接口是Executor，顶层接口Executor提供了一种思想：将任务提交和任务执行进行解耦。用户无需关注如何创建线程，如何调度线程来执行任务，用户只需提供Runnable对象，将任务的运行逻辑提交到执行器(Executor)中，由Executor框架完成线程的调配和任务的执行部分。ExecutorService接口增加了一些能力：（1）扩充执行任务的能力，补充可以为一个或一批异步任务生成Future的方法；（2）提供了管控线程池的方法，比如停止线程池的运行。AbstractExecutorService则是上层的抽象类，将执行任务的流程串联了起来，保证下层的实现只需关注一个执行任务的方法即可。最下层的实现类ThreadPoolExecutor实现最复杂的运行部分，ThreadPoolExecutor将会一方面维护自身的生命周期，另一方面同时管理线程和任务，使两者良好的结合从而执行并行任务。

## 线程池的核心类：`ThreadPoolExecutor`

Java 提供的线程池主要通过 `java.util.concurrent.ThreadPoolExecutor` 实现。

```bash
public ThreadPoolExecutor(    int corePoolSize,        // 核心线程数（常驻）    int maximumPoolSize,     // 最大线程数    long keepAliveTime,      // 非核心线程的存活时间    TimeUnit unit,           // 上面参数的单位    BlockingQueue<Runnable> workQueue,  // 任务队列    ThreadFactory threadFactory,        // 线程工厂（创建线程的方式）    RejectedExecutionHandler handler    // 拒绝策略)
```

* * *

## 线程池参数详解

<table class="has-fixed-layout"><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>corePoolSize</td><td>核心线程数，线程池中始终保留的线程数量。</td></tr><tr><td>maximumPoolSize</td><td>最大线程数。线程池能创建的最大线程数（包括核心线程）。</td></tr><tr><td>keepAliveTime</td><td>非核心线程的空闲存活时间。超过这个时间会被销毁。</td></tr><tr><td>unit</td><td>存活时间单位，如 TimeUnit.SECONDS。</td></tr><tr><td>workQueue</td><td>任务缓存队列（如 ArrayBlockingQueue、LinkedBlockingQueue）。</td></tr><tr><td>threadFactory</td><td>自定义线程创建方式，可设置线程名、守护线程等。</td></tr><tr><td>handler</td><td>拒绝策略，线程池已满时的处理方式。</td></tr></tbody></table>

* * *

## 任务执行流程

![](https://s.muxui.com:8015/images/2026/09/bx02hI5u1kt0.webp)

1.  若线程数 < corePoolSize → **创建新线程执行任务**
2.  若线程数 ≥ corePoolSize → **放入队列**
3.  若队列满且线程数 < maximumPoolSize → **创建新线程执行任务**
4.  若线程数 ≥ maximumPoolSize 且队列也满 → **触发拒绝策略**

* * *

## 常见线程池拒绝策略（`RejectedExecutionHandler`）

<table class="has-fixed-layout"><thead><tr><th>策略</th><th>含义</th></tr></thead><tbody><tr><td>AbortPolicy</td><td>默认策略，抛出 RejectedExecutionException 异常。</td></tr><tr><td>CallerRunsPolicy</td><td>谁提交谁执行（任务回退给主线程）。</td></tr><tr><td>DiscardPolicy</td><td>直接丢弃任务，不抛异常。</td></tr><tr><td>DiscardOldestPolicy</td><td>丢弃队列最旧的任务，尝试执行当前任务。</td></tr></tbody></table>

* * *

## 常用线程池队列（`BlockingQueue`）

<table class="has-fixed-layout"><thead><tr><th>队列类型</th><th>特点</th></tr></thead><tbody><tr><td>ArrayBlockingQueue</td><td>有界，数组实现，必须设置容量，<strong>适合固定大小任务量</strong></td></tr><tr><td>LinkedBlockingQueue</td><td>可设容量（默认无限），链表实现，<strong>适合任务突发</strong></td></tr><tr><td>SynchronousQueue</td><td>不缓存任务，直接传递给线程，<strong>适合高并发、立即处理任务</strong></td></tr></tbody></table>

* * *

**如何创建线程池？**

**推荐：使用 `ThreadPoolExecutor`，避免 `Executors` 工厂方法（不推荐）**

```bash
ExecutorService threadPool = new ThreadPoolExecutor(    2, 5,    10, TimeUnit.SECONDS,    new LinkedBlockingQueue<>(100),    Executors.defaultThreadFactory(),    new ThreadPoolExecutor.AbortPolicy());
```

**不推荐的 `Executors`（会导致OOM）：**

```bash
Executors.newFixedThreadPool(10); // 队列无界Executors.newCachedThreadPool();  // 线程无限Executors.newSingleThreadExecutor(); // 只有一个线程
```

* * *

## 线程池使用示例

```java
public class ThreadPoolDemo {    public static void main(String args) {        ExecutorService pool = new ThreadPoolExecutor(            2, 4,            10, TimeUnit.SECONDS,            new ArrayBlockingQueue<>(5),            Executors.defaultThreadFactory(),            new ThreadPoolExecutor.CallerRunsPolicy()        );        for (int i = 0; i < 10; i++) {            final int taskId = i;            pool.execute(() -> {                System.out.println("任务 " + taskId + " 执行线程: " + Thread.currentThread().getName());            });        }        pool.shutdown(); // 关闭线程池    }}
```

* * *

## 阿里巴巴线程池规范（强烈建议背熟）

使用 **ThreadPoolExecutor** 自定义线程池，**禁止**使用 **Executors** 提供的默认线程池，原因是：

-   `FixedThreadPool` 和 `SingleThreadPool` 使用的是**无界队列**，可能导致 OOM；
-   `CachedThreadPool` 使用的是**无界线程数量**，也可能 OOM；
-   推荐设置合理 `队列大小` 和 `最大线程数`；

* * *

## Executors

`Executors` 是 Java 提供的线程池工厂工具类，位于 `java.util.concurrent.Executors` 包中，它提供了一些**快速创建线程池、定时任务线程池、单线程执行器**的方法，使用简单，但也有一些坑（如无界队列、OOM 等问题）。

**Executors 常用方法总览**

<table class="has-fixed-layout"><thead><tr><th>方法名</th><th>描述</th><th>推荐程度</th></tr></thead><tbody><tr><td>newFixedThreadPool(int nThreads)</td><td>固定线程数线程池</td><td>❌ 不推荐（使用无界队列）</td></tr><tr><td>newCachedThreadPool()</td><td>缓存线程池，线程数不限制</td><td>❌ 不推荐（线程数无界）</td></tr><tr><td>newSingleThreadExecutor()</td><td>单线程线程池</td><td>❌ 不推荐（无界队列）</td></tr><tr><td>newScheduledThreadPool(int corePoolSize)</td><td>支持定时/周期执行的线程池</td><td>✅ 合理使用</td></tr><tr><td>newSingleThreadScheduledExecutor()</td><td>单线程定时线程池</td><td>✅ 可用于简单定时任务</td></tr><tr><td>newWorkStealingPool() （Java 8+）</td><td>ForkJoinPool 支持的多任务窃取线程池</td><td>✅ 特定并行任务</td></tr><tr><td>callable(Runnable task, V result)</td><td>把 Runnable 转为 Callable</td><td>✅ 工具方法</td></tr><tr><td>unconfigurableExecutorService(...)</td><td>包装不可配置的线程池</td><td>✅ 安全场景用</td></tr><tr><td>privilegedThreadFactory()</td><td>获取当前线程上下文权限的 ThreadFactory</td><td>✅ 高安全场景</td></tr><tr><td>defaultThreadFactory()</td><td>默认线程工厂（可用于手动 ThreadPoolExecutor）</td><td>✅ 常用</td></tr></tbody></table>

* * *

**重点方法说明**

**1\. newFixedThreadPool(int nThreads)**

```bash
ExecutorService pool = Executors.newFixedThreadPool(5);
```

-   特点：线程数固定，超出部分任务排队执行
-   使用：适合任务量固定、不会突发堆积的场景
-   ⚠️ **问题：使用的是无界队列**，易造成内存堆积 ➜ ❌不推荐

* * *

**2\. newCachedThreadPool()**

```bash
ExecutorService pool = Executors.newCachedThreadPool();
```

-   特点：线程数量无限制（Integer.MAX\_VALUE）
-   使用：适合大量、短周期的轻量任务
-   ⚠️ **问题：线程无限增长**，易 OOM ➜ ❌不推荐

* * *

**3\. newSingleThreadExecutor()**

```bash
ExecutorService pool = Executors.newSingleThreadExecutor();
```

-   特点：只有一个线程，串行执行任务
-   使用：任务必须顺序执行场景
-   ⚠️ **问题：队列无界，线程挂了会自动创建新线程**，可能隐藏问题 ➜ ❌不推荐用于生产高并发

* * *

**4\. newScheduledThreadPool(int corePoolSize)**

```bash
ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
```

-   特点：支持定时、周期性任务，基于 `ScheduledThreadPoolExecutor`
-   使用：定时任务（如日志归档、缓存刷新）
-   ✅ 推荐使用，但建议配合 `ThreadFactory` + 拒绝策略显式构造更安全

* * *

**5\. newWorkStealingPool()**

```bash
ExecutorService pool = Executors.newWorkStealingPool(); // Java 8+
```

✅ 高性能，但不适合高并发请求处理，且无法精细控制线程池参数

特点：基于 `ForkJoinPool`，自动按 CPU 核心数创建工作线程

使用：适合并行分治任务（如大数据分片处理）

**推荐做法（线程池最佳实践）**

**阿里巴巴 Java 开发**手册强烈建议不要使用 **Executors**，而是手动构造：

```bash
ThreadPoolExecutor pool = new ThreadPoolExecutor(    10, 20,    60L, TimeUnit.SECONDS,    new ArrayBlockingQueue<>(200),    Executors.defaultThreadFactory(), // 可替换为自定义命名工厂    new ThreadPoolExecutor.CallerRunsPolicy());
```

* * *

**拓展方法**

<table class="has-fixed-layout"><thead><tr><th>方法</th><th>说明</th></tr></thead><tbody><tr><td>Executors.callable(Runnable task)</td><td>把 Runnable 包装成 Callable（返回 null）</td></tr><tr><td>Executors.defaultThreadFactory()</td><td>返回默认线程工厂，线程名如：pool-1-thread-1</td></tr><tr><td>Executors.privilegedThreadFactory()</td><td>创建带当前 AccessControlContext 的线程</td></tr><tr><td>Executors.unconfigurableExecutorService()</td><td>包装线程池，不允许调用配置方法（如 shutdownNow）</td></tr></tbody></table>

* * *

**总结：Executors 方法使用建议**

<table class="has-fixed-layout"><thead><tr><th>方法</th><th>是否推荐</th><th>说明</th></tr></thead><tbody><tr><td>newFixedThreadPool</td><td>❌</td><td>无界队列风险</td></tr><tr><td>newCachedThreadPool</td><td>❌</td><td>无界线程数风险</td></tr><tr><td>newSingleThreadExecutor</td><td>❌</td><td>无界队列、线程替换隐藏问题</td></tr><tr><td>newScheduledThreadPool</td><td>✅</td><td>合理控制线程数</td></tr><tr><td>newWorkStealingPool</td><td>✅</td><td>高吞吐并行计算</td></tr><tr><td>自定义 ThreadPoolExecutor</td><td>✅强烈推荐</td><td>可精细控制每个参数，安全、灵活</td></tr></tbody></table>

* * *

## ScheduledThreadPoolExecutor

`**ScheduledThreadPoolExecutor**` 是 Java 中专门用于执行**定时任务**和**周期任务**的线程池，它比 `Timer` 更强大、更安全，是企业级定时任务的首选方案。

**`ScheduledThreadPoolExecutor` 是什么？**

`ScheduledThreadPoolExecutor` 是一个线程池，支持以下几种定时任务调度：

<table class="has-fixed-layout"><thead><tr><th>调度类型</th><th>描述</th></tr></thead><tbody><tr><td><strong>延迟执行</strong></td><td>延迟固定时间后执行一次任务</td></tr><tr><td><strong>周期执行（固定速率）</strong></td><td>每隔固定时间开始执行（忽略任务执行时长）</td></tr><tr><td><strong>周期执行（固定延迟）</strong></td><td>每次任务执行完后，延迟固定时间再开始下一次</td></tr></tbody></table>

它是 `Executors.newScheduledThreadPool(int corePoolSize)` 的底层实现类，继承自 `ThreadPoolExecutor`。

![](https://s.muxui.com:8015/OXhATjkxIZ6w.webp)

* * *

**创建线程池的方式**

```bash
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
```

等价于：

```bash
ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(    2,    Executors.defaultThreadFactory(),    new ThreadPoolExecutor.AbortPolicy());
```

* * *

**常用方法介绍**

1\. schedule(Runnable command, long delay, TimeUnit unit)

延迟固定时间后执行一次

```bash
scheduler.schedule(() -> {    System.out.println("延迟 3 秒后执行一次任务");}, 3, TimeUnit.SECONDS);
```

* * *

**2\. scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit)**

周期执行（固定速率）：每隔 period 时间触发一次任务，不管任务执行多久

```bash
scheduler.scheduleAtFixedRate(() -> {    System.out.println("每 5 秒执行一次，固定速率");}, 1, 5, TimeUnit.SECONDS);
```

✅ 适合：定时轮询任务（比如定时监控、健康检查）

⚠️ 注意：如果任务执行超过周期，会出现**任务并发执行重叠**

* * *

**3\. scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit)**

周期执行（固定延迟）：每次任务执行完之后，等 delay 时间再执行下一次

```bash
scheduler.scheduleWithFixedDelay(() -> {    System.out.println("每次执行完后再等 5 秒执行");}, 1, 5, TimeUnit.SECONDS);
```

✅ 适合：任务耗时不固定、希望每次之间有固定“间隔”

* * *

**含义和区别：**

<table class="has-fixed-layout"><thead><tr><th>方法</th><th>重复？</th><th>延迟/周期点</th><th>执行时机</th><th>并发执行</th></tr></thead><tbody><tr><td>schedule(Runnable, delay)</td><td>否（一次性）</td><td>延迟 delay 后执行一次</td><td>不管任务执行多长时间，到达延迟点就执行一次</td><td>不会重复，也不存在并发问题</td></tr><tr><td>scheduleAtFixedRate(Runnable, initialDelay, period)</td><td>是（固定速率）</td><td>以调度开始时间为基准，每隔 period 安排一次</td><td>上一次<strong>开始</strong>时间 + period 到点就触发</td><td>不会并发执行（内部串行），但如果执行慢于 period，会“立即”补跑</td></tr><tr><td>scheduleWithFixedDelay(Runnable, initialDelay, delay)</td><td>是（固定延迟）</td><td>以上一次<strong>结束</strong>时间为基准，结束后再延迟 delay</td><td>上一次<strong>完成</strong>时间 + delay 到点才触发</td><td>同样不并发执行</td></tr></tbody></table>

* * *

**与 Timer 的区别（为什么用 ScheduledThreadPoolExecutor）**

<table class="has-fixed-layout"><thead><tr><th>比较点</th><th><code>Timer</code></th><th><code>ScheduledThreadPoolExecutor</code></th></tr></thead><tbody><tr><td>错误隔离</td><td>❌ 一个任务出异常会终止所有任务</td><td>✅ 一个任务异常不影响其他任务</td></tr><tr><td>并发支持</td><td>❌ 单线程</td><td>✅ 多线程</td></tr><tr><td>精度</td><td>一般</td><td>更精确</td></tr><tr><td>线程管理</td><td>❌ 不支持</td><td>✅ 支持线程回收、拒绝策略等</td></tr></tbody></table>

✅ 所以：**推荐使用 `ScheduledThreadPoolExecutor` 替代 `Timer`**

* * *

**推荐封装方式（更安全、更灵活）**

```bash
ScheduledThreadPoolExecutor scheduler = new ScheduledThreadPoolExecutor(    4,    new BasicThreadFactory.Builder()        .namingPattern("scheduled-task-%d")        .daemon(true)        .build(),    new ThreadPoolExecutor.AbortPolicy());
```

-   `BasicThreadFactory` 是来自 `commons-lang3` 的工具类，可设置线程名、是否守护线程
-   可结合监控系统收集执行时间、失败次数等

* * *

**注意事项**

<table class="has-fixed-layout"><thead><tr><th>问题</th><th>建议</th></tr></thead><tbody><tr><td>任务执行时间过长</td><td>建议使用 scheduleWithFixedDelay 避免任务重叠</td></tr><tr><td>出现异常未捕获</td><td>用 try-catch 包裹任务逻辑，避免线程退出</td></tr><tr><td>执行慢造成堆积</td><td>可使用 ScheduledExecutorService.shutdownNow() 停止并清理</td></tr><tr><td>定时任务过多</td><td>拆分多个线程池，按业务划分执行优先级</td></tr></tbody></table>

* * *

**实战示例：每晚 2 点定时执行**

```java
public class DailyTask {    public static void main(String args) {        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);        Runnable task = () -> {            System.out.println("执行每日任务：" + LocalDateTime.now());        };        long initialDelay = computeInitialDelay(); // 计算当前时间到 2 点的间隔        long period = 24 * 60 * 60; // 每 24 小时执行一次        scheduler.scheduleAtFixedRate(task, initialDelay, period, TimeUnit.SECONDS);    }    private static long computeInitialDelay() {        LocalDateTime now = LocalDateTime.now();        LocalDateTime nextRun = now.withHour(2).withMinute(0).withSecond(0);        if (now.compareTo(nextRun) > 0) {            nextRun = nextRun.plusDays(1);        }        return Duration.between(now, nextRun).getSeconds();    }}
```

* * *

## 相关阅读

[[java-thread-fundamentals|Java 线程基础知识]]
