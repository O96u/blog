---
slug: java-thread-fundamentals
title: Java线程知识
description: 线程基础 Java线程是什么？ 线程 （Thread）是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位。 进程 （Process）：程序运行的实例，每个进程有独立的内存空间。 线程 ：进程内部的执行单元，可以
date: 2025-06-19
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




## 线程基础

**Java线程是什么？**

**线程**（Thread）是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位。

-   **进程**（Process）：程序运行的实例，每个进程有独立的内存空间。
-   **线程**：进程内部的执行单元，可以多个线程共享同一个进程的内存资源。

**Java线程**指的是Java程序中用`Thread`类或实现`Runnable`接口创建的轻量级执行单元。一个Java应用至少有一个线程（main线程）。

* * *

**为什么要用线程？**

-   **并发执行**：让程序可以同时做多件事，比如下载、界面响应、计算等互不阻塞。
-   **资源共享**：同一个进程内的多个线程可以共享数据，减少资源消耗，通信高效。
-   **提高性能**：多核CPU上利用多线程能让程序跑得更快（合理使用的话）。

* * *

### **创建线程的方式**

**继承 Thread 类**

```bash
class MyThread extends Thread {
    public void run() {
        System.out.println("MyThread is running");
    }
}
new MyThread().start();
```

**实现 Runnable 接口**

```bash
class MyRunnable implements Runnable {
    public void run() {
        System.out.println("MyRunnable is running");
    }
}
new Thread(new MyRunnable()).start();
```

**实现 Callable 接口 + Future**

```bash
Callable<Integer> task = () -> {
    return 123;
};
FutureTask<Integer> future = new FutureTask<>(task);
new Thread(future).start();
Integer result = future.get(); // 等待执行完
```

**区别：**

-   `Thread`直接继承，不适合多继承。
-   `Runnable`/`Callable`推荐（面向接口，更灵活）。

* * *

### 线程的生命周期

Java 线程状态分为几个阶段：

<table class="has-fixed-layout"><thead><tr><th>状态</th><th>说明</th></tr></thead><tbody><tr><td>NEW</td><td>新建，刚创建，还没启动（new Thread时）</td></tr><tr><td>RUNNABLE</td><td>可运行，包括正在运行和就绪等待CPU</td></tr><tr><td>BLOCKED</td><td>阻塞，等待锁</td></tr><tr><td>WAITING</td><td>等待，等待其他线程唤醒（如wait()/join()）</td></tr><tr><td>TIMED_WAITING</td><td>超时等待（如sleep(n)、wait(n)、join(n)）</td></tr><tr><td>TERMINATED</td><td>终止，线程执行完毕</td></tr></tbody></table>

**状态切换典型例子**

-   `start()`：NEW -> RUNNABLE
-   等待 CPU 分配：RUNNABLE -> RUNNING
-   `sleep()/wait()/join()`：RUNNING -> TIMED\_WAITING/WAITING
-   获取不到锁：BLOCKED
-   `notify()/notifyAll()`：WAITING -> RUNNABLE
-   执行完 `run()`：RUNNING -> TERMINATED

* * *

### 常用线程操作方法

-   `start()` ：启动线程
-   `run()` ：线程要执行的代码
-   `sleep(ms)` ：让当前线程休眠指定时间（不释放锁）
-   `join()` ：等待另一个线程执行完毕
-   `interrupt()` ：中断线程（设置中断标志，具体还要自己响应）
-   `isAlive()` ：判断线程是否还在运行

* * *

**例子：多线程打印**

**让两个线程交替打印数字：**

```java
public class PrintDemo {
    public static void main(String[] args) {
        Runnable task = () -> {
            for (int i = 0; i < 5; i++) {
                System.out.println(Thread.currentThread().getName() + ": " + i);
            }
        };
        Thread t1 = new Thread(task, "A");
        Thread t2 = new Thread(task, "B");
        t1.start();
        t2.start();
    
}
```

**输出样例：**

```yaml
A: 0
B: 0
A: 1
B: 1
...
```

* * *

### 面试题举例

**1\. Thread 和 Runnable 的区别？哪种更推荐？**

**答：**

-   Thread 是类，Runnable 是接口。
-   Thread 本身也实现了 Runnable。
-   如果继承 Thread，不能再继承其他类（Java 单继承）。
-   实现 Runnable 更灵活，便于资源共享、可配合线程池等。
-   推荐使用 Runnable。

**解析：**

-   面试官想考你“类和接口的区别”、Java 的单继承特性和面向接口编程思想。

* * *

**2\. 直接调用 run() 和 start() 有什么区别？**

**答：**

-   `start()` 会新建一个线程，让线程异步并发执行 `run()`。
-   `run()` 只是一个普通方法调用，会在当前线程（通常是 main 线程）里顺序执行，不会新建线程。

**代码举例：**

```bash
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));t.run();   // maint.start(); // Thread-0
```

**解析：**

-   主要考你是否理解线程启动的机制，很多初学者会混淆这两者。

* * *

**3\. Java 线程的生命周期有哪些状态？各状态之间如何转换？**

**答：**

-   状态有：NEW、RUNNABLE、BLOCKED、WAITING、TIMED\_WAITING、TERMINATED。
-   NEW --(start)--> RUNNABLE --(获取CPU)--> RUNNING
-   RUNNING --(wait/sleep/join/lock)--> WAITING/BLOCKED/TIMED\_WAITING
-   WAITING --(notify/join结束)--> RUNNABLE
-   RUNNING --(run结束)--> TERMINATED

**解析：**

-   考察你是否了解多线程的本质和线程调度机制。

* * *

**4\. 为什么建议用 Runnable 而不是 Thread？**

**答：**

-   Runnable是接口，可实现多继承，Thread是类只可单继承。
-   Runnable代码和线程对象分离，便于解耦、代码复用。
-   Runnable更适合资源共享。
-   线程池只能提交 Runnable/Callable，不接受 Thread。

**解析：**

-   考察你面向接口编程思想和并发框架适配能力。

* * *

**5\. 线程在什么情况下会进入 BLOCKED/WAITING/TIMED\_WAITING 状态？**

**答：**

-   BLOCKED：等待获取 synchronized 锁时进入（比如两个线程抢一个锁）。
-   WAITING：调用 Object.wait()、Thread.join()、LockSupport.park() 等，线程无限等待。
-   TIMED\_WAITING：调用 Thread.sleep(time)、wait(time)、join(time)、parkNanos() 等，超时等待。

**解析：**

-   你要清楚每种等待的应用场景和 API。

* * *

**6\. 线程池为什么只能提交 Runnable/Callable，不能直接提交 Thread？**

**答：**

-   线程池的任务提交方法参数是 Runnable 或 Callable，底层线程池会把它包装到自己的工作线程（Worker）去执行，而不是直接管理 Thread 对象。
-   Thread 是线程实例，不适合作为任务的“逻辑单元”，Runnable/Callable 更轻便、复用性高。

**解析：**

-   体现面向接口编程、线程池架构设计思想。

* * *

**7\. 常见代码题：下面这段代码输出什么？**

```java
public class Demo {    public static void main(String args) {        Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));        t.run();        t.start();    }}
```

**答：**

```text
mainThread-0
```

**解析：**

-   `t.run()` 只是普通方法调用，输出 `main`
-   `t.start()` 启动新线程，输出 `Thread-0`

* * *

**8\. 说出你知道的线程的常用方法，并简要说明作用**

**答：**

-   start()：启动线程
-   run()：线程体方法
-   sleep(ms)：让当前线程休眠指定毫秒数
-   join()：让当前线程等待目标线程执行完毕
-   interrupt()：中断线程（设置中断标志位）
-   isAlive()：判断线程是否存活

**解析：**

-   体现你实际开发经验和 API 熟悉度。

* * *

**9\. 线程安全问题是怎么产生的？举例说明**

**答：**

-   多个线程同时访问同一共享资源（如变量、集合）且有写操作时，线程切换可能导致数据不一致，即线程安全问题。

**代码举例：**

```bash
class Counter {    public int count = 0;    public void incr() { count++; }}
```

两个线程同时执行 incr()，结果可能小于2，说明数据被覆盖了。

* * *

**10\. 线程用完后为什么不能复用？如何提高线程复用效率？**

**答：**

-   Thread 对象只能启动一次（start()），否则会抛出 IllegalThreadStateException。
-   为提高效率，推荐使用线程池（如 Executors），线程池中的线程可以复用，避免频繁创建销毁。

### 在哪些场景会用到线程？

**1\. 提高程序性能、充分利用多核CPU**

**场景举例：**

-   **批量数据处理**  
    比如：对 100 万条数据做运算，把数据分成 10 份，开 10 个线程，每个线程处理一份，最后合并结果，大大加快速度。
-   **大文件处理**  
    文件分块多线程上传或下载。

* * *

**2\. 避免阻塞主线程，提高用户体验**

**场景举例：**

-   **GUI 应用/移动端开发**  
    比如：Swing/Android 开发中，如果网络请求、文件读写都在主线程，界面会卡死。必须放到子线程里处理，主线程负责界面响应。
-   **Web服务中的异步任务**  
    用户下单后订单信息入库是主流程，但发短信、邮件等操作可以用新线程或线程池异步处理，提升接口响应速度。

* * *

**3\. 处理需要并发访问的场景**

**场景举例：**

-   **高并发 Web 服务器**  
    Tomcat、Jetty等Web服务器为每个请求分配线程（或线程池中的线程），可以同时处理成百上千的请求。
-   **聊天室/游戏服务器**  
    每个用户一个线程，实时通信。

* * *

**4\. 定时、周期性任务**

**场景举例：**

-   **定时任务调度**  
    通过 ScheduledExecutorService，每隔一段时间自动执行某项任务（如每5分钟同步数据）。
-   **日志异步落盘**  
    日志框架往往会用线程异步写磁盘，避免主业务阻塞。

* * *

**5\. 多线程爬虫/数据采集**

**场景举例：**

-   **多线程爬虫**  
    爬取多个网站页面，每个页面一个线程，同时采集，提高抓取效率。
-   **多线程文件上传/下载**  
    分块并发上传大文件，比如网盘、断点续传。

* * *

**6\. 并行计算/任务分片**

**场景举例：**

-   **矩阵运算/科学计算**  
    大规模计算任务分解为多个线程，并行处理。
-   **视频转码**  
    视频按片段切分，每段用一个线程转码，最后拼接结果。

* * *

**7\. 线程池场景（资源有限、任务繁多）**

**场景举例：**

-   **消息队列消费者**  
    多线程从消息队列（如RabbitMQ、Kafka）取消息，提升吞吐量。
-   **Web爬虫任务池**  
    多线程不断处理任务队列中的爬虫任务。

* * *

**8\. 其他场景**

-   **异步事件驱动编程**（比如Netty，虽然底层不完全用传统线程，但线程池是基础）
-   **并发缓存刷新**
-   **文件系统监听与同步**

## 线程同步（synchronized、Lock）

### 一、为什么需要线程同步？

-   **线程安全问题**：多个线程同时访问/修改同一个资源（如变量、集合），可能导致数据混乱（脏读、丢数据等）。
-   **举例：**

```bash
class Counter {
    int count = 0;
    void incr() { count++; }
}
// 多线程执行incr()，count结果可能不是你预期的
```

**结论**：要保证共享数据的正确性，需要**线程同步**，让同一时刻只能有一个线程修改资源。

* * *

### 二、synchronized 同步机制

**1\. 基本语法**

-   **修饰实例方法**：锁住当前实例对象

```bash
public synchronized void incr() { count++; }
```

-   **修饰静态方法**：锁住类对象（Class对象）

```bash
public static synchronized void incr() { ... }
```

-   **修饰代码块**：指定锁对象

```bash
public void incr() {
    synchronized(this) { count++; }
    // 或 synchronized(某个对象) { ... }
}
```

**2\. 作用范围**

-   **实例方法**：锁住当前对象（this），同一个对象同一时刻只有一个线程进入该方法。
-   **静态方法**：锁住Class对象（全类唯一）。
-   **代码块**：可以灵活指定锁粒度（如锁某个共享变量、类对象等）。

**3\. synchronized 的原理**

-   每个对象有一个“内置锁”（Monitor），synchronized 本质就是拿这个锁。
-   获取不到锁的线程会阻塞，直到获得锁。

**4\. synchronized 代码演示**

```java
class SafeCounter {
    private int count = 0;

    public synchronized void incr() {
        count++;
    }

    public int getCount() {
        return count;
    }
}

public class Demo {
    public static void main(String[] args) throws InterruptedException {
        SafeCounter counter = new SafeCounter();
        Thread t1 = new Thread(() -> { for (int i=0; i<10000; i++) counter.incr(); });
        Thread t2 = new Thread(() -> { for (int i=0; i<10000; i++) counter.incr(); });
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println(counter.getCount()); // 20000
    }
}
```

**没有同步，结果可能小于 20000；加了 synchronized，一定是 20000。**

* * *

### 三、Lock 接口及其实现

**1\. Lock 概述**

-   `Lock` 是 `java.util.concurrent.locks` 包下的接口，比 `synchronized` 更灵活。
-   常用实现：`ReentrantLock`（可重入锁）

**2\. 基本用法**

```python
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

class SafeCounter2 {
    private int count = 0;
    private final Lock lock = new ReentrantLock();

    public void incr() {
        lock.lock();         // 加锁
        try {
            count++;
        } finally {
            lock.unlock();   // 解锁，必须写在finally防止死锁
        }
    }

    public int getCount() {
        return count;
    }
}
```

**3\. Lock 的优势**

-   能响应中断（`lockInterruptibly()`）
-   可以**尝试获取锁**（`tryLock()`）
-   支持公平/非公平锁
-   支持条件变量（`Condition`，可实现更灵活的线程通信）

* * *

### 四、synchronized VS Lock

<table class="has-fixed-layout"><thead><tr><th>方面</th><th>synchronized</th><th>Lock (如ReentrantLock)</th></tr></thead><tbody><tr><td>JDK版本</td><td>关键字，JVM层实现</td><td>类库，JDK 1.5后</td></tr><tr><td>解锁方式</td><td>自动（方法/代码块执行完自动释放）</td><td>手动（需要unlock，容易死锁）</td></tr><tr><td>是否可重入</td><td>是</td><td>是</td></tr><tr><td>是否可中断</td><td>否</td><td>是（lockInterruptibly）</td></tr><tr><td>是否公平锁</td><td>否</td><td>可选（构造时指定公平性）</td></tr><tr><td>条件变量</td><td>无</td><td>有（Condition）</td></tr><tr><td>性能</td><td>JDK1.6以后，差别很小</td><td>灵活场景更多</td></tr></tbody></table>

**总结：**

-   **简单用法优先synchronized**（易读，易维护）。
-   **复杂并发控制、可中断、公平锁、条件队列等用Lock**。

* * *

### 五、常见线程同步场景举例

**1\. 银行账户转账（防止两个人同时转账导致余额出错）**

```bash
class Account {    private int balance = 1000;    public synchronized void withdraw(int money) {        if (balance >= money) balance -= money;    }}
```

**2\. 多线程安全队列**

-   用 `Lock` 实现队列的线程安全入队出队
-   JDK 自带 `ConcurrentLinkedQueue` 等并发容器（底层就是 CAS/锁）

* * *

### 六、常见面试/笔试陷阱

-   **忘记用 unlock()，导致死锁**

```bash
lock.lock();
// 代码异常没有finally unlock，锁永远不释放
```

-   **锁对象不同导致同步失败**

```bash
synchronized(new Object()) { ... } // 每次都是新对象，没有同步效果
```

-   **误以为 static synchronized 锁住所有实例，其实只锁类对象**

* * *

### 七、最佳实践建议

-   多线程只锁**真正需要同步的最小代码块**，避免扩大锁粒度，防止性能下降。
-   如果锁住的是**静态资源**，一定要锁 Class 对象（如`synchronized(ClassName.class)`）。
-   用 Lock 的时候一定要 unlock() 写在 finally 里。
-   面试时会被问：**如何避免死锁？怎么用Lock写出更灵活的同步控制？**

* * *

### 八、死锁问题复现

**1\. 什么是死锁？**

-   死锁（Deadlock）：多个线程因互相持有对方需要的锁资源，导致都永远等待下去，程序卡住。
-   直观理解：
    -   线程A拿着资源1，要等资源2；线程B拿着资源2，要等资源1；谁都不肯放手，谁都等不到。

**2\. 死锁经典代码复现**

```java
public class DeadLockDemo {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                System.out.println("Thread1 got lockA");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lockB) {
                    System.out.println("Thread1 got lockB");
                }
            }
        });

        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                System.out.println("Thread2 got lockB");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lockA) {
                    System.out.println("Thread2 got lockA");
                }
            }
        });

        t1.start();
        t2.start();
    }
}
```

**运行结果：**

```bash
Thread1 got lockA
Thread2 got lockB
// 程序一直卡住，不再输出
```

**原因：**

-   t1 获得 lockA，t2 获得 lockB，之后双方都在等待对方释放锁，永远卡住。

* * *

**如何避免死锁？**

**1\. 尽量保证获取多个锁时顺序一致**

-   **方案**：统一规定加锁顺序，比如永远先拿lockA再拿lockB。
-   **改造代码**：

```bash
// 两个线程都先拿lockA再拿lockB，不会死锁
Runnable task = () -> {
    synchronized (lockA) {
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        synchronized (lockB) {
            System.out.println(Thread.currentThread().getName() + " got both locks");
        }
    }
};
// t1和t2都用同一个顺序
```

**2\. 尽量减少锁的持有时间、减少同步范围**

-   锁只包裹最小、最关键的代码块，避免不必要的锁嵌套。

**3\. 避免嵌套锁（能不多层加锁就不多层）**

-   有些场景通过业务设计避免多重锁定。

**4\. 使用 tryLock 尝试获取锁，失败立即释放已持有的锁**

-   利用 Lock 的 tryLock 特性，可以让线程在拿不到全部锁时“主动放弃”，避免死锁。

* * *

**用Lock写更灵活的同步控制**

**1\. ReentrantLock 支持 tryLock（核心功能！）**

-   **基本思想**：尝试同时获取所有锁，失败则释放已获得的锁并稍后重试，防止死锁。

**例子：避免死锁的 tryLock 实现**

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class TryLockAvoidDeadlock {
    private static final Lock lockA = new ReentrantLock();
    private static final Lock lockB = new ReentrantLock();

    public static void main(String[] args) {
        Runnable task1 = () -> {
            while (true) {
                if (lockA.tryLock()) {
                    try {
                        Thread.sleep(100); // 模拟业务
                        if (lockB.tryLock()) {
                            try {
                                System.out.println("Task1 got both locks!");
                                break; // 成功获得所有锁，跳出
                            } finally {
                                lockB.unlock();
                            }
                        }
                    } catch (InterruptedException e) {} 
                    finally {
                        lockA.unlock();
                    }
                }
                // 失败时稍微等下再试
                try { Thread.sleep(10); } catch (InterruptedException e) {}
            }
        };

        Runnable task2 = () -> {
            while (true) {
                if (lockB.tryLock()) {
                    try {
                        Thread.sleep(100);
                        if (lockA.tryLock()) {
                            try {
                                System.out.println("Task2 got both locks!");
                                break;
                            } finally {
                                lockA.unlock();
                            }
                        }
                    } catch (InterruptedException e) {}
                    finally {
                        lockB.unlock();
                    }
                }
                try { Thread.sleep(10); } catch (InterruptedException e) {}
            }
        };

        new Thread(task1).start();
        new Thread(task2).start();
    }
}
```

**说明：**

-   tryLock 如果拿不到锁不会阻塞，直接返回false，这样线程能主动释放已持有的锁和重试，避免僵死等待。

* * *

### 问：如果两个线程中,程序挂了,会当如何？

这个“如果两个线程中，程序挂了，会当如何”——这个问题我拆分一下理解：

-   如果你的意思是**线程死锁卡住了**，两个线程都在等对方，不会继续往下走，但整个Java进程（JVM）不会自动退出，进程会一直挂着（CPU/内存不会释放），直到你手动kill进程或用工具分析。
-   如果你的意思是**线程执行代码抛出了异常**（比如空指针、数组越界），这时候分几种情况，下面详细说说：

* * *

**1\. 线程发生死锁（Deadlock）**

-   两个线程都在等待对方释放锁，谁也不让步，**不会抛出异常**，只是这两个线程永远卡住。
-   只要主线程没退出（比如main方法还在等），**整个Java程序会一直处于“卡死”状态**，你只能用 jstack/jconsole 查看线程堆栈，或者重启程序。

* * *

**2\. 线程内部抛出异常**

**2.1 主线程抛出异常**

-   主线程（main）如果抛出未捕获异常，主线程会退出，**但进程不会马上终止**，因为还有其他子线程可能还在跑。

**2.2 子线程抛出异常**

-   子线程如果抛出异常（没catch），该线程会退出，但不会影响其他线程。
-   **不会导致整个Java程序（JVM进程）挂掉或退出**，其他线程继续跑。
-   如果这个子线程很重要（比如线程池里的worker），那它挂了后，相关任务会失败，但程序总体还活着。

**例子：**

```java
public class Demo {
    public static void main(String[] args) {
        Thread t = new Thread(() -> {
            System.out.println("子线程开始");
            int x = 1/0; // 这里异常
            System.out.println("子线程结束");
        });
        t.start();
        System.out.println("main线程结束");
    }
}
```

输出类似：

```bash
子线程开始
main线程结束
Exception in thread "Thread-0" java.lang.ArithmeticException: / by zero
    at ...
```

-   线程 Thread-0 挂了，main线程没受影响，JVM进程还会活着直到所有线程都退出。

* * *

**3\. 线程组/线程池中线程异常**

-   在线程池中，如果任务抛出异常，只影响当前任务，线程池会自动回收、继续接收新任务。
-   但如果**线程异常没人捕获且主线程已经退出，且没有非守护线程存活，JVM会自动退出**。

* * *

**4\. 怎样防止线程因异常挂掉影响业务？**

-   用 `try-catch` 包裹线程体，日志输出异常，确保即使出错也能优雅处理：

```bash
Runnable task = () -> {
    try {
        // 业务代码
    } catch (Exception e) {
        e.printStackTrace();
    }
};
```

-   对于线程池，可以用`ThreadPoolExecutor`的`afterExecute`回调，统一日志处理。

* * *

**5\. 死锁挂住如何处理？**

-   **定位死锁**：jstack/jconsole 工具可以看到“waiting to lock...”的线程栈，能发现死锁。
-   **手动干预**：一般只能重启服务或优化代码。
-   **预防**：如上面说的 tryLock、锁顺序统一等。

* * *

**6\. 其他特殊情况**

-   如果你的主线程是守护线程（daemon thread），所有非守护线程退出后，JVM 会自动退出。
-   但只要有**非守护线程（比如死锁、死循环）活着，JVM就不会自动退出**。

* * *

**小结**

-   单个线程挂了不会影响整个程序，除非它是最后一个非守护线程。
-   死锁会让程序卡住不动，但不会自动报错退出。
-   要健壮，多用 try-catch 保证线程异常能被日志记录，不影响主流程。
-   生产环境最好有线程存活/心跳监控，死锁检测和自动报警。

## 理解JMM和可见性问题

### 一、什么是 JMM（Java 内存模型）？

-   JMM是Java语言中规定的**多线程并发时，变量如何在内存中存储、读取和传递**的一套规范。
-   目的是：**屏蔽不同硬件和操作系统的内存访问差异，让Java程序员写出的多线程代码能在所有平台下表现一致。**

* * *

### 二、为什么需要 JMM？

1.  **多核CPU下的高速缓存导致“可见性”问题**
    -   每个CPU都有自己的缓存，各个线程可以同时运行在不同CPU上。
    -   线程A在自己的CPU缓存里修改了变量，线程B在另一个CPU的缓存里还没看到这个最新值。
2.  **指令重排序**
    -   为了提升性能，JVM和CPU都可以对代码执行顺序做优化。
    -   可能导致代码实际运行顺序和我们写出来的顺序不同，从而出错。

* * *

### 三、JMM的三大核心问题

1.  **原子性**：操作不可被线程切割（一次完成）。比如++不是原子操作。
2.  **可见性**：一个线程修改了变量，其他线程能否立即看到这个变化？
3.  **有序性**：程序执行顺序是否和代码顺序一致？

* * *

### 四、可见性问题的现象和举例

**1\. 代码示例：可见性问题**

```java
public class VisibilityDemo {
    private static boolean flag = false;

    public static void main(String[] args) throws Exception {
        new Thread(() -> {
            while (!flag) {
                // do nothing
            }
            System.out.println("线程检测到flag变为true");
        }).start();

        Thread.sleep(1000);
        flag = true;
        System.out.println("main线程已修改flag=true");
    }
}
```

**你可能期望输出：**

```bash
main线程已修改flag=true
线程检测到flag变为true
```

**但实际运行时输出：**

```bash
main线程已修改flag=true
```

而子线程里的`System.out.println("线程检测到flag变为true");`**永远不会执行！**

**这是为什么？**

**2.1 JMM的内存模型决定了这种情况**

-   Java 的每个线程都有自己的**工作内存**（可以理解为“线程私有变量的副本”）。
-   当子线程开始时，会把 `flag` 的值从主内存**拷贝到自己的工作内存**。
-   子线程在 while 循环里，一直判断自己的“副本flag”，如果主线程把主内存的 flag 改为 true，但**子线程不会自动刷新自己的flag副本**。
-   所以**子线程一直看到的都是原来的false**，while循环永远不退出。

**2.2 不是每次都出现！**

-   有时候你加一条输出（比如在while里打印），或者改成debug模式，JVM的“优化”行为会变，副本会被刷新，表现出正确结果。这就是\*\*“偶现/不稳定”问题\*\*，更难排查。

**结论：这不是Java“Bug”，而是JMM特意的规定**

-   Java这样设计，是为了**多线程下的性能**（缓存机制、减少主内存的读写压力）。
-   只有当你用**synchronized/volatile**等方式，才强制各线程刷新变量。

* * *

### 五、JMM对可见性问题的规定

-   JMM规定了**主内存（Main Memory）和每个线程的工作内存（Working Memory）**。
-   变量必须先拷贝到线程工作内存，再从工作内存写回主内存。
-   线程间通信，**必须通过主内存**。
-   线程自己工作区变量改了，不保证立刻刷回主内存。

* * *

### 六、解决可见性问题的常用方法

**1\. 使用 `volatile` 关键字**

-   **作用**：保证变量对所有线程**立即可见**，每次读写都强制从主内存读/写。
-   **缺点**：只能保证可见性和有序性，不保证原子性。

```bash
private static volatile boolean flag = false;
```

**2\. 使用 `synchronized` 关键字**

-   进入/退出同步块时，JMM会保证**变量的刷新**（解锁前会把本地工作内存的变量写回主内存，加锁后清空本地缓存重新读取主内存）。
-   因此，synchronized 既保证了**可见性**，又能保证**原子性**。

**3\. 使用 `Lock`（如ReentrantLock）**

-   lock() 和 unlock() 同步也会带来可见性保证。

* * *

### 七、指令重排序与 volatile 的“内存屏障”作用

-   volatile 原理其实就是加了“内存屏障”，禁止 JVM/CPU 优化时乱序执行，保证前后的代码顺序对其他线程可见。
-   synchronized 也有相似效果（加锁/解锁时会有内存屏障）。

```bash
// 仅保证可见性
private static volatile boolean flag = false;

// 既保证可见性又保证原子性
public synchronized void setFlag(boolean value) { flag = value; }
```

* * *

**volatile能保证什么？不能保证什么？**

**volatile能保证：**

-   **可见性**：一个线程修改变量，其他线程立刻可见。
-   **有序性**：禁止指令重排（保证前后的操作不会被JVM/CPU优化错乱顺序）。

**volatile不能保证：**

-   **原子性**：一个操作“不可再分”，volatile不保证复合操作的原子性。

**举例（不保证原子性）：**

```bash
private static volatile int count = 0;
public static void main(String[] args) {
    new Thread(() -> { for(int i=0;i<10000;i++) count++; }).start();
    new Thread(() -> { for(int i=0;i<10000;i++) count++; }).start();
    // 结果可能小于20000，说明++不是原子操作
}
```

* * *

### synchronized和volatile的区别？

<table class="has-fixed-layout"><thead><tr><th>对比点</th><th>volatile</th><th>synchronized</th></tr></thead><tbody><tr><td>关键字类型</td><td>修饰变量</td><td>修饰方法/代码块</td></tr><tr><td>可见性</td><td>保证</td><td>保证</td></tr><tr><td>原子性</td><td>不保证</td><td>保证</td></tr><tr><td>有序性</td><td>保证（禁止重排）</td><td>保证（进入/退出内存屏障）</td></tr><tr><td>性能</td><td>性能高，适合状态标志</td><td>性能低，涉及线程调度</td></tr><tr><td>适用场景</td><td>状态标志、单例双检锁等</td><td>复杂逻辑同步、复合操作</td></tr></tbody></table>

* * *

**原子性、可见性、有序性各举一个代码例子**

**原子性举例：**

```bash
private static int count = 0;
public static void main(String[] args) throws Exception {
    Thread t1 = new Thread(() -> { for(int i=0;i<10000;i++) count++; });
    Thread t2 = new Thread(() -> { for(int i=0;i<10000;i++) count++; });
    t1.start(); t2.start(); t1.join(); t2.join();
    System.out.println(count); // 结果可能小于20000，++不是原子操作
}
```

**可见性举例：**

```bash
private static boolean running = true;
Thread t = new Thread(() -> {
    while (running) {} // 没有volatile或synchronized修饰，主线程改了，子线程看不到
});
t.start();
Thread.sleep(1000);
running = false; // 子线程可能永远跳不出循环
```

**有序性举例（指令重排序）：**

```bash
int a = 0, b = 0, x = 0, y = 0;
Thread t1 = new Thread(() -> { a = 1; x = b; });
Thread t2 = new Thread(() -> { b = 1; y = a; });
// 理论上x、y都为1，但由于指令重排，有可能x=0或y=0
```

## 相关阅读

[[java-thread-pool-guide|Java 线程池实战]]
