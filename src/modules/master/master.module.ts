import { Global, Module } from '@nestjs/common';

import { ArticleModule } from './article/article.module';
import { ArtistModule } from './artist/artist.module';
import { BannerModule } from './banner/banner.module';
import { ContactModule } from './contact/contact.module';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { ParamsModule } from './params/params.module';
import { MenuModule } from './menu/menu.module';

@Global()
@Module({
  imports: [
    ArticleModule,
    ArtistModule,
    BannerModule,
    ContactModule,
    ExhibitionsModule,
    MenuModule,
    ParamsModule,
  ],
})
export class MasterModule {}
