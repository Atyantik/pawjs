import _ from "lodash";

export const hasFeaturedMedia = (post, size = "thumbnail") => {
  if (!post.featured_media) return false;
  return !!_.get(post , `_embedded["wp:featuredmedia"][0].media_details.sizes.${size}`, false);
};

export const getFeaturedMediaUrl = (post, size) => {
  if (!hasFeaturedMedia(post, size)) return "";
  return _.get(post , `_embedded["wp:featuredmedia"][0].media_details.sizes.${size}.source_url`, "");
};