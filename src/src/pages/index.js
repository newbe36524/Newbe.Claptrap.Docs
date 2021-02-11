import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";

const features = [
  {
    title: translate({
      message: "轻松应对并发问题",
      description: "The homepage 轻松应对并发问题",
    }),
    imageUrl: "img/undraw_docusaurus_mountain.svg",
    description: translate({
      message: (
        <>
          基于 Actor
          模式和事件溯源模式作为基础原理，轻松处理并发环境下的问题处理。
        </>
      ),
      description: "The homepage 轻松应对并发问题 detail",
    }),
  },
  {
    title: translate({
      message: "完全支持水平扩展",
      description: "The homepage 完全支持水平扩展",
    }),
    imageUrl: "img/undraw_docusaurus_tree.svg",
    description: translate({
      message: (
        <>依托 dapr/Orleans 框架等与生俱来的水平扩展能力，轻松做到从一到百。</>
      ),
      description: "The homepage 完全支持水平扩展 detail",
    }),
  },
  {
    title: translate({
      message: "全面关注完整周期",
      description: "The homepage 全面关注完整周期",
    }),
    imageUrl: "img/undraw_docusaurus_react.svg",
    description: translate({
      message: (
        <>
          从设计，到开发，到上线。每个环节都是我们考虑的要素。每个环节我们都充分考虑。
        </>
      ),
      description: "The homepage 全面关注完整周期 detail",
    }),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

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
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
