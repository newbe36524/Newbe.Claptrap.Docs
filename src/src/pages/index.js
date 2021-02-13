import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Docs about Newbe.Claptrap project"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <img
            src={require("/static/images/20190228-002.gif").default}
            alt="Example banner"
          />
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className={clsx("col col--4", styles.feature)}>
                <div className="text--center">
                  <img
                    className={styles.featureImage}
                    src={useBaseUrl("images/concurrency.svg")}
                  />
                </div>
                <h3>
                  <Translate
                    id="homepage.轻松应对并发问题"
                    description="The homepage 轻松应对并发问题"
                  >
                    轻松应对并发问题
                  </Translate>
                </h3>
                <p>
                  <Translate
                    id="homepage.轻松应对并发问题.details"
                    description="The homepage 基于 Actor 模式和事件溯源模式作为基础原理，轻松处理并发环境下的问题处理。"
                  >
                    基于 Actor
                    模式和事件溯源模式作为基础原理，轻松处理并发环境下的问题处理。
                  </Translate>
                </p>
              </div>
              <div className={clsx("col col--4", styles.feature)}>
                <div className="text--center">
                  <img
                    className={styles.featureImage}
                    src={useBaseUrl("images/scale-out.svg")}
                  />
                </div>
                <h3>
                  <Translate
                    id="homepage.完全支持水平扩展"
                    description="The homepage 完全支持水平扩展"
                  >
                    完全支持水平扩展
                  </Translate>
                </h3>
                <p>
                  <Translate
                    id="homepage.完全支持水平扩展.details"
                    description="The homepage 依托 Dapr/Orleans 框架等与生俱来的水平扩展能力，轻松做到从一到百。"
                  >
                    依托 Dapr/Orleans
                    框架等与生俱来的水平扩展能力，轻松做到从一到百。
                  </Translate>
                </p>
              </div>
              <div className={clsx("col col--4", styles.feature)}>
                <div className="text--center">
                  <img
                    className={styles.featureImage}
                    src={useBaseUrl("images/full-lifetime.svg")}
                  />
                </div>
                <h3>
                  <Translate
                    id="homepage.全面关注完整周期"
                    description="The homepage 全面关注完整周期"
                  >
                    全面关注完整周期
                  </Translate>
                </h3>
                <p>
                  <Translate
                    id="homepage.全面关注完整周期.details"
                    description="The homepage 从设计，到开发，到上线。每个环节都是我们考虑的要素。每个环节我们都充分考虑。"
                  >
                    从设计，到开发，到上线。每个环节都是我们考虑的要素。每个环节我们都充分考虑。
                  </Translate>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
