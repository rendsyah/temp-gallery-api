import { Global, Module } from '@nestjs/common';

import { ArticleModule } from './article/article.module';
import { BannerModule } from './banner/banner.module';
import { ContactModule } from './contact/contact.module';
import { ParamsModule } from './params/params.module';
import { MenuModule } from './menu/menu.module';

@Global()
@Module({
  imports: [ArticleModule, BannerModule, ContactModule, MenuModule, ParamsModule],
})
export class MasterModule {}
