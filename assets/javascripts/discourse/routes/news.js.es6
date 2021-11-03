import buildTopicRoute from "discourse/routes/build-topic-route";
import { popupAjaxError } from 'discourse/lib/ajax-error';
import { ajax } from 'discourse/lib/ajax';
import EmberObject from '@ember/object';

export default buildTopicRoute('news', {
  model(data, transition) {
    if (this.siteSettings.discourse_news_source === 'rss') {
      return ajax("/news").then((result) => {
        return EmberObject.create({
          filter: '',
          topics: result.map(t => {
            return EmberObject.create({
              title: t.title,
              description: t.description,
              url: t.url,
              image_url: t.image_url,
              rss: true
            });
          })
        });
      }).catch(popupAjaxError);
    } else {
      return this._super(data, transition);
    }
  },
      
  afterModel(model) {
    if (this.siteSettings.discourse_news_sidebar_topic_list && !this.site.mobileView) {
      const filter = this.siteSettings.discourse_news_sidebar_topic_list_filter || 'latest';
      return this.store.findFiltered("topicList", { filter })
        .then(list => {
          const limit = this.siteSettings.discourse_news_sidebar_topic_list_limit || 10;
          this.set('sidebarTopics', list.topics.slice(0, limit));
        });
    } else {
      return true;
    }
  },
  
  renderTemplate() {
    this.render("news", {
      controller: "discovery/topics",
      outlet: "list-container"
    });
  },
  
  setupController(controller, model) {
    this._super(controller, model);
    let extraOpts = {};
    if (this.sidebarTopics) extraOpts['sidebarTopics'] = this.sidebarTopics;
    this.controllerFor("discovery/topics").setProperties(extraOpts);
  },
});
