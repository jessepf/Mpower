## Written by jessepfrancis@gmail.com
# Fetches json, trims unwanted fields and creates local json files
# Wrote a common script for all my apps

##############################################
## Common variables and locating directory
##############################################
website=http://mpower.provisionasia.org/wp-json/wp/v2/

postType=toolkit
cd ../www/assets/toolkit

articles_filter='?per_page=40&order=asc&_query=\[*\].\{id:id,title:title.rendered,excerpt:excerpt.rendered,content:content.rendered,image:featured_media\}'
toolkit_filters='&categories=4'
challenge_filters='&categories=47'

##############################################
## toolkit articles meta generator
##############################################
rm *
echo $website$postType$articles_filter$toolkit_filters
echo `curl "$website$postType$articles_filter$toolkit_filters"` >> toolkit_meta.json
echo `curl "$website$postType$articles_filter$challenge_filters"` >> challenge_meta.json
